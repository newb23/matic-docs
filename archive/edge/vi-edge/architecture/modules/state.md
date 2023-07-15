---
id: state
title: Trạng thái
description: Giải thích về mô-đun trạng thái của Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - state
  - trie
---

Để thực sự hiểu cách **Trạng thái** hoạt động, bạn cần hiểu một số khái niệm Ethereum cơ bản.<br />

Bạn nên đọc **[Hướng dẫn về trạng thái trong Ethereum](https://ethereum.github.io/execution-specs/autoapi/ethereum/frontier/state/index.html)**.

## Tổng quan {#overview}

Sau khi làm quen với các khái niệm Ethereum cơ bản, phần tổng quan tiếp theo sẽ khá dễ hiểu.


Như đã đề cập, **Trạng thái thế giới trie** chứa tất cả các tài khoản Ethereum tồn tại. <br />Những tài khoản này là nhánh của Merkle Trie.
 Mỗi nhánh sẽ mã hóa thông tin **Trạng thái Tài khoản**.


Điều này giúp Polygon Edge nhận được một Merkle Trie cụ thể vào thời điểm cụ thể. <br />Ví dụ, chúng ta có thể lấy băm của trạng thái tại khối 10.


Merkle Trie, tại một thời điểm bất kỳ được gọi là ***Snapshot***.

Chúng ta có thể lấy các ***Snapshot*** của **trạng thái trie** hoặc của **bộ nhớ trie** - chúng về cơ bản là như nhau. <br />Điểm khác biệt duy nhất là ý nghĩa của nhánh:

* Đối với bộ nhớ trie, các nhánh chứa một trạng thái tùy ý, chúng ta không thể xử lý và không thể biết có gì trong đó

* Còn đối với trạng thái trie, các nhánh đại diện cho các tài khoản

````go title="state/state.go
type State interface {
    // Gets a snapshot for a specific hash
	NewSnapshotAt(types.Hash) (Snapshot, error)

	// Gets the latest snapshot
	NewSnapshot() Snapshot

	// Gets the codeHash
	GetCode(hash types.Hash) ([]byte, bool)
}
````

Giao diện **Snapshot** được định nghĩa là:

````go title="state/state.go
type Snapshot interface {
    // Gets a specific value for a leaf
	Get(k []byte) ([]byte, bool)

	// Commits new information
	Commit(objs []*Object) (Snapshot, []byte)
}
````

Thông tin có thể cam kết, được xác định bằng *Cấu trúc Đối tượng*:


````go title="state/state.go
// Object is the serialization of the radix object
type Object struct {
	Address  types.Address
	CodeHash types.Hash
	Balance  *big.Int
	Root     types.Hash
	Nonce    uint64
	Deleted  bool

	DirtyCode bool
	Code      []byte

	Storage []*StorageObject
}
````

Quá trình triển khai Merkle Trie nằm trong thư mục *state/immutable-trie*<br/>.
 *state/immutable-trie/state.go* triển khai giao diện **Trạng thái**.

*state/immutable-trie/trie.go* là đối tượng Merkle Trie chính. Đây được coi là một phiên bản tối ưu của Merkle Trie, sử dụng lại nhiều bộ nhớ nhất có thể.


## Trình thực thi {#executor}

*state/executor.go* chứa tất cả các thông tin cần thiết để Polygon Edge quyết định cách một khối thay đổi trạng thái hiện thời. Quá trình triển khai của *ProcessBlock* nằm ở đây.


Phương thức *áp dụng* thực hiện chuyển đổi trạng thái.
 Trình thực thi sẽ gọi EVM.

````go title="state/executor.go"
func (t *Transition) apply(msg *types.Transaction) ([]byte, uint64, bool, error) {
	// check if there is enough gas in the pool
	if err := t.subGasPool(msg.Gas); err != nil {
		return nil, 0, false, err
	}

	txn := t.state
	s := txn.Snapshot()

	gas, err := t.preCheck(msg)
	if err != nil {
		return nil, 0, false, err
	}
	if gas > msg.Gas {
		return nil, 0, false, errorVMOutOfGas
	}

	gasPrice := new(big.Int).SetBytes(msg.GetGasPrice())
	value := new(big.Int).SetBytes(msg.Value)

	// Set the specific transaction fields in the context
	t.ctx.GasPrice = types.BytesToHash(msg.GetGasPrice())
	t.ctx.Origin = msg.From

	var subErr error
	var gasLeft uint64
	var returnValue []byte

	if msg.IsContractCreation() {
		_, gasLeft, subErr = t.Create2(msg.From, msg.Input, value, gas)
	} else {
		txn.IncrNonce(msg.From)
		returnValue, gasLeft, subErr = t.Call2(msg.From, *msg.To, msg.Input, value, gas)
	}

	if subErr != nil {
		if subErr == runtime.ErrNotEnoughFunds {
			txn.RevertToSnapshot(s)
			return nil, 0, false, subErr
		}
	}

	gasUsed := msg.Gas - gasLeft
	refund := gasUsed / 2
	if refund > txn.GetRefund() {
		refund = txn.GetRefund()
	}

	gasLeft += refund
	gasUsed -= refund

	// refund the sender
	remaining := new(big.Int).Mul(new(big.Int).SetUint64(gasLeft), gasPrice)
	txn.AddBalance(msg.From, remaining)

	// pay the coinbase
	coinbaseFee := new(big.Int).Mul(new(big.Int).SetUint64(gasUsed), gasPrice)
	txn.AddBalance(t.ctx.Coinbase, coinbaseFee)

	// return gas to the pool
	t.addGasPool(gasLeft)

	return returnValue, gasUsed, subErr != nil, nil
}
````

## Thời gian chạy {#runtime}

Khi thực thi chuyển đổi trạng thái, mô-đun chính thực thi việc chuyển đổi trạng thái là EVM (nằm trong
 state/runtime/evm).

**Bảng điều khiển** thực hiện khớp lệnh giữa **opcode** và chỉ dẫn.


````go title="state/runtime/evm/dispatch_table.go"
func init() {
	// unsigned arithmetic operations
	register(STOP, handler{opStop, 0, 0})
	register(ADD, handler{opAdd, 2, 3})
	register(SUB, handler{opSub, 2, 3})
	register(MUL, handler{opMul, 2, 5})
	register(DIV, handler{opDiv, 2, 5})
	register(SDIV, handler{opSDiv, 2, 5})
	register(MOD, handler{opMod, 2, 5})
	register(SMOD, handler{opSMod, 2, 5})
	register(EXP, handler{opExp, 2, 10})

	...

	// jumps
	register(JUMP, handler{opJump, 1, 8})
	register(JUMPI, handler{opJumpi, 2, 10})
	register(JUMPDEST, handler{opJumpDest, 0, 1})
}
````

Logic cốt lõi cung cấp năng lượng cho EVM là vòng lặp *Run*.
<br />

Đây là điểm nhập chính dành cho EVM. Nó thực hiện vòng lặp và kiểm tra opcode hiện thời, truy xuất hướng dẫn, kiểm tra xem có thể thực hiện, tiêu thụ gas và thực thi lệnh hướng dẫn cho đến khi thất bại hoặc bị dừng.

````go title="state/runtime/evm/state.go"

// Run executes the virtual machine
func (c *state) Run() ([]byte, error) {
	var vmerr error

	codeSize := len(c.code)

	for !c.stop {
		if c.ip >= codeSize {
			c.halt()
			break
		}

		op := OpCode(c.code[c.ip])

		inst := dispatchTable[op]

		if inst.inst == nil {
			c.exit(errOpCodeNotFound)
			break
		}

		// check if the depth of the stack is enough for the instruction
		if c.sp < inst.stack {
			c.exit(errStackUnderflow)
			break
		}

		// consume the gas of the instruction
		if !c.consumeGas(inst.gas) {
			c.exit(errOutOfGas)
			break
		}

		// execute the instruction
		inst.inst(c)

		// check if stack size exceeds the max size
		if c.sp > stackSize {
			c.exit(errStackOverflow)
			break
		}

		c.ip++
	}

	if err := c.err; err != nil {
		vmerr = err
	}

	return c.ret, vmerr
}
````
