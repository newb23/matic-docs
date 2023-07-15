---
id: troubleshooting
title: Khắc phục sự cố
description: "Phần khắc phục sự cố dành cho Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Khắc phục sự cố {#troubleshooting}

## Lỗi `method=eth_call err="invalid signature"` {#error}

Khi bạn đang sử dụng ví để thực hiện giao dịch với Polygon Edge, hãy đảm bảo rằng trong thiết lập mạng cục bộ ví của bạn:

1. `chainID`là đúng. `chainID`mặc định cho Edge là `100`, nhưng có thể được tùy chỉnh bằng cờ genesis `--chain-id`.

````bash
genesis [--chain-id CHAIN_ID]
````
2. Đảm bảo rằng, trên trường “URL RPC”, bạn sử dụng cổng JSON RPC của nút bạn đang kết nối.


## Cách lấy URL WebSocket {#how-to-get-a-websocket-url}

Theo mặc định, khi bạn chạy Polygon Edge, nó sẽ hiển thị một điểm cuối WebSocket dựa trên vị trí chuỗi. Lược đồ URL `wss://` được sử dụng cho các liên kết HTTPS và `ws://` cho HTTP.

URL Localhost Websocket:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Vui lòng lưu ý rằng số cổng phụ thuộc vào cổng JSON-RPC đã chọn cho nút.

URL Websocket Edgenet:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## Lỗi `insufficient funds` khi cố gắng triển khai hợp đồng {#error-when-trying-to-deploy-a-contract}

Nếu bạn gặp lỗi này, hãy đảm bảo rằng bạn có đủ tiền tại địa chỉ mong muốn và địa chỉ được sử dụng là địa chỉ chính xác.<br/> Để thiết lập số dư định trước, bạn có thể sử dụng cờ genesis `genesis [--premine ADDRESS:VALUE]`khi đang tạo tệp genesis. Ví dụ sử dụng cờ này:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Lệnh này định trước 1000000000000000000000 WEI cho 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862.


## Token ERC20 không được phát hành khi sử dụng Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

Nếu bạn cố gắng chuyển token ERC20 giữa Polygon POS và mạng Edge cục bộ, và token ERC20 của bạn được nạp, đề xuất cũng được thực thi tại trình chuyển tiếp, nhưng token không được phát hành trong mạng Edge của bạn, hãy đảm bảo ERC20 Handler trong chuỗi Polygon Edge có đủ token để phát hành. <br/>Hợp đồng Handler trong chuỗi đích phải có đủ token để phát hành cho chế độ giải phóng khóa. Nếu bạn không có bất kỳ token ERC20 nào trong ERC20 Handler thuộc mạng Edge cục bộ của bạn, vui lòng mint token mới và chuyển chúng sang ERC20 Handler.

## Lỗi `Incorrect fee supplied` khi sử dụng Chainbridge {#error-when-using-chainbridge}

Bạn có thể gặp lỗi này khi cố gắng chuyển token ERC20 giữa chuỗi Mumbai Polygon POS và thiết lập Polygon Edge cục bộ. Lỗi này xuất hiện khi bạn đặt phí triển khai sử dụng cờ `--fee`, nhưng bạn không đặt cùng một giá trị trong giao dịch nộp tiền. Bạn có thể sử dụng lệnh bên dưới để thay đổi phí:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Bạn có thể tìm thêm thông tin về lá cờ [này.](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md)





