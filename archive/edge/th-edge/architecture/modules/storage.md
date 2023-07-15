---
id: storage
title: Storage
description: คำอธิบายเกี่ยวกับโมดูล storage ของ Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## ภาพรวม {#overview}

ปัจจุบัน Polygon Edge ใช้ **LevelDB** สำหรับการจัดเก็บข้อมูล และพื้นที่จัดเก็บข้อมูล**ในหน่วยความจำ**

ทั่วทั้ง Polygon Edge เมื่อโมดูลจำเป็นต้องโต้ตอบกับที่เก็บข้อมูลที่รองรับโมดูลไม่จำเป็นต้องรู้ว่ากำลังสื่อสารกับเอนจิ้นหรือบริการ DB ใดอยู่

เลเยอร์ DB ได้รับการแยกออกมาระหว่างโมดูลที่ชื่อ **Storage** ซึ่งส่งออกอินเทอร์เฟซต่างๆ ที่โมดูลสืบค้น

เฉพาะในตอนนี้ แต่ละเลเยอร์ DB **LevelDB** จะนำเมธอดเหล่านี้ไปใช้แยกกัน เพื่อให้แน่ใจว่าเหมาะกับการนำไปใช้ของตัวเอง

````go title="blockchain/storage/storage.go"
// Storage is a generic blockchain storage
type Storage interface {
	ReadCanonicalHash(n uint64) (types.Hash, bool)
	WriteCanonicalHash(n uint64, hash types.Hash) error

	ReadHeadHash() (types.Hash, bool)
	ReadHeadNumber() (uint64, bool)
	WriteHeadHash(h types.Hash) error
	WriteHeadNumber(uint64) error

	WriteForks(forks []types.Hash) error
	ReadForks() ([]types.Hash, error)

	WriteDiff(hash types.Hash, diff *big.Int) error
	ReadDiff(hash types.Hash) (*big.Int, bool)

	WriteHeader(h *types.Header) error
	ReadHeader(hash types.Hash) (*types.Header, error)

	WriteCanonicalHeader(h *types.Header, diff *big.Int) error

	WriteBody(hash types.Hash, body *types.Body) error
	ReadBody(hash types.Hash) (*types.Body, error)

	WriteSnapshot(hash types.Hash, blob []byte) error
	ReadSnapshot(hash types.Hash) ([]byte, bool)

	WriteReceipts(hash types.Hash, receipts []*types.Receipt) error
	ReadReceipts(hash types.Hash) ([]*types.Receipt, error)

	WriteTxLookup(hash types.Hash, blockHash types.Hash) error
	ReadTxLookup(hash types.Hash) (types.Hash, bool)

	Close() error
}
````

## LevelDB {#leveldb}

### ส่วนนำหน้า {#prefixes}

ในการทำให้การสืบค้นการจัดเก็บ LevelDB เป็นแบบ Deterministic และเพื่อหลีกเลี่ยงการขัดแย้งกันของการจัดเก็บคีย์ Polygon Edge ใช้ประโยชน์จากส่วนนำหน้าและส่วนนำหน้าย่อยเมื่อจัดเก็บข้อมูล

````go title="blockchain/storage/keyvalue.go"
// Prefixes for the key-value store
var (
	// DIFFICULTY is the difficulty prefix
	DIFFICULTY = []byte("d")

	// HEADER is the header prefix
	HEADER = []byte("h")

	// HEAD is the chain head prefix
	HEAD = []byte("o")

	// FORK is the entry to store forks
	FORK = []byte("f")

	// CANONICAL is the prefix for the canonical chain numbers
	CANONICAL = []byte("c")

	// BODY is the prefix for bodies
	BODY = []byte("b")

	// RECEIPTS is the prefix for receipts
	RECEIPTS = []byte("r")

	// SNAPSHOTS is the prefix for snapshots
	SNAPSHOTS = []byte("s")

	// TX_LOOKUP_PREFIX is the prefix for transaction lookups
	TX_LOOKUP_PREFIX = []byte("l")
)

// Sub-prefixes
var (
	HASH   = []byte("hash")
	NUMBER = []byte("number")
	EMPTY  = []byte("empty")
)
````

## แผนสำหรับอนาคต {#future-plans}

แผนสำหรับอนาคตอันใกล้นี้ประกอบด้วย การเพิ่มโซลูชัน DB ที่ได้รับความนิยมมากที่สุด เช่น:
* PostgreSQL
* MySQL


## 📜 ทรัพยากร {#resources}
* **[LevelDB](https://github.com/google/leveldb)**