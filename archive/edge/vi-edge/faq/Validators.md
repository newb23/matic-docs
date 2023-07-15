---
id: validators
title: Hỏi đáp về trình xác thực
description: "Hỏi đáp về trình xác thực của Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Cách thức để thêm/gỡ bỏ trình xác thực? {#how-to-add-remove-a-validator}

### PoA {#poa}
Việc thêm/gỡ bỏ trình xác thực được thực hiện bằng cách bỏ phiếu. Bạn có thể xem hướng dẫn đầy đủ ở [đây](/docs/edge/consensus/poa).

### PoS {#pos}
Bạn có thể xem hướng dẫn về góp cổ phần tại [đây](/docs/edge/consensus/pos-stake-unstake) (đây là cách để một nút trở thành trình xác thực) và cách hủy bỏ (loại bỏ trình xác thực).

Vui lòng lưu ý rằng:

- Bạn có thể sử dụng cờ khởi nguồn `--max-validator-count` để thiết lập số lượng người góp cổ phần tối đa có thể tham gia tập hợp trình xác nhận.

- Bạn có thể sử dụng cờ khởi nguồn `--min-validator-count ` để thiết lập số lượng người góp cổ phần tối thiểu cần tham gia tập hợp trình xác nhận (theo mặc định là `1`).
- Khi đạt số lượng trình xác thực tối đa, bạn sẽ không thể thêm một trình xác thực khác trừ khi bạn xóa một trình xác thực hiện có khỏi tập hợp (việc số tiền góp cổ phần của trình xác thực mới cao hơn là không quan trọng).
 Nếu bạn gỡ bỏ một trình xác thực, số lượng trình xác thực còn lại không được thấp hơn `--min-validator-count`.
- Ngưỡng mặc định là `1` đơn vị tiền tệ mạng (gas) để trở thành trình xác thực.




## Dung lượng ổ đĩa được khuyến nghị cho trình xác thực là bao nhiêu?
 {#how-much-disk-space-is-recommended-for-a-validator}

Chúng tôi khuyên bạn nên bắt đầu với 100G để dự phòng và cần đảm bảo rằng bạn có thể nâng cấp ổ đĩa về sau.



## Có giới hạn về số lượng trình xác thực không?
 {#is-there-a-limit-to-the-number-of-validators}

Về các giới hạn kỹ thuật, Polygon Edge không có giới hạn rõ ràng về số lượng nút bạn có thể có trong một mạng.
 Bạn có thể thiết lập giới hạn kết nối (số lượng kết nối đến/đi) trên cơ sở mỗi nút.


Còn về giới hạn thực tế, bạn sẽ thấy hiệu suất bị giảm sút khi so sánh cụm 100 nút với cụm 10 nút.
 Khi tăng số lượng các nút trong cụm, bạn sẽ tăng độ phức tạp của giao tiếp và mạng tổng quát nói chung.
 Tất cả phụ thuộc vào loại mạng bạn đang chạy và loại cấu trúc liên kết mạng bạn có.


## Cách thức để chuyển từ PoA sang PoS?
 {#how-to-switch-from-poa-to-pos}

PoA là cơ chế đồng thuận mặc định.
 Đối với một cụm mới, để chuyển sang PoS, bạn sẽ cần thêm cờ `--pos` khi tạo tệp khởi nguồn.
 Nếu có một cụm đang hoạt động, bạn có thể tìm hiểu về cách chuyển đổi [tại đây](/docs/edge/consensus/migration-to-pos). Tất cả thông tin bạn cần biết về các cơ chế đồng thuận và thiết lập của chúng tôi đều có thể được tìm thấy trong phần [sự đồng thuận](/docs/edge/consensus/poa).


## Cách thức để cập nhật các nút khi có thay đổi đột ngột?
 {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

Bạn có thể xem hướng dẫn chi tiết về cách thực hiện quy trình này [tại đây](/docs/edge/validator-hosting#update).


## Có thể định cấu hình số tiền góp cổ phần tối thiểu trên PoS Edge không?
 {#is-the-minimum-staking-amount-configurable-for-pos-edge}

Số tiền góp cổ phần tối thiểu theo mặc định là `1 ETH` và không thể được định cấu hình.

## Tại sao các lệnh JSON RPC `eth_getBlockByNumber` và `eth_getBlockByHash` không trả về địa chỉ của người khai thác?
 {#not-return-the-miner-s-address}

Cơ chế đồng thuận hiện được sử dụng trong Polygon Edge là IBFT 2.0, được xây dựng dựa trên cơ chế bỏ phiếu, thông tin thêm tại Clique PoA: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).


Nói về EIP-225 (Clique PoA), đây là phần giải thích mục đích sử dụng của  `miner`(hay còn gọi là `beneficiary`):


<blockquote>Chúng tôi sử dụng lại các trường tiêu đề ethash như sau:
<ul>
<li><b>người thụ hưởng / người khai thác:</b> Địa chỉ để đề xuất sửa đổi danh sách người ký được ủy quyền.
</li>
<ul>
<li>Trường này thường được điền số 0, chỉ được sửa đổi khi biểu quyết.
</li>
<li>Tuy nhiên, các giá trị tùy ý vẫn được cho phép (ngay cả những giá trị vô nghĩa như khi bỏ phiếu loại bỏ người không phải người ký) để tránh thêm phức tạp trong việc triển khai cơ chế bỏ phiếu.
</li>
<li>Các khối điểm kiểm soát phải được điền số 0 (ví dụ: giao dịch epoch).
</li>
</ul>

</ul>

</blockquote>

Do đó, trường `miner` được sử dụng để đề xuất biểu quyết cho một địa chỉ nhất định, thay vì để hiển thị người đề xuất của khối.


Thông tin về người đề xuất của khối có thể được tìm thấy bằng cách khôi phục khóa công khai từ trường Con dấu của trường dữ liệu bổ sung được mã hóa RLP Istanbul trong tiêu đề khối.


## Phần nào và giá trị của Genesis có thể được sửa đổi an toàn? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Vui lòng đảm bảo tạo một bản sao bằng tay của tệp genesis.json trước khi cố gắng sửa nó. Ngoài ra, toàn bộ chuỗi phải được dừng lại trước khi chỉnh lại tệp tin gen.json. Một khi tệp tin genesis được sửa đổi, phiên bản mới hơn của nó sẽ được phát hành trên tất cả các nút không xác thực và nút của người val.

:::

**Chỉ phần bootnodes của tệp tin genesis mới có thể được sửa đổi an toàn**, nơi bạn có thể thêm hoặc gỡ bỏ bootnodes khỏi danh sách.