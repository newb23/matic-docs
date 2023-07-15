---
id: query-json-rpc
title: Truy vấn điểm cuối JSON RPC
description: "Truy vấn dữ liệu và bắt đầu chuỗi với tài khoản định trước."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Tổng quan {#overview}

Lớp JSON-RPC của Polygon Edge cung cấp cho các nhà phát triển chức năng tương tác dễ dàng với blockchain, thông qua yêu cầu HTTP.

Ví dụ này bao gồm việc sử dụng các công cụ như **curl** để truy vấn thông tin, cũng như bắt đầu chuỗi với tài khoản định trước, và gửi giao dịch.

## Bước 1: Tạo tệp tin genesis bằng tài khoản định trước {#step-1-create-a-genesis-file-with-a-premined-account}

Để tạo tệp tin genesis, hãy chạy lệnh sau:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

Cờ **premine** đặt địa chỉ cần được đưa vào với số dư ban đầu trong tệp tin **genesis**.<br /> Trong trường hợp này, địa chỉ `0x1010101010101010101010101010101010101010` sẽ có **số dư mặc định** ban đầu là
`0xD3C21BCECCEDA1000000`(1 triệu đồng tiền bản địa).

Nếu chúng ta muốn chỉ định số dư, chúng ta có thể tách số dư và địa chỉ bằng một `:`, như sau:
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

Số dư có thể là một `hex` hoặc giá trị `uint256`.

:::warning Chỉ với những tài khoản định trước mà bạn có khoá riêng tư!

Nếu bạn xác định trước các tài khoản và không có khóa riêng tư để truy cập, số dư định trước của bạn sẽ không thể sử dụng được
:::

## Bước 2: Khởi động Polygon Edge ở chế độ nhà phát triển {#step-2-start-the-polygon-edge-in-dev-mode}

Để bắt đầu Polygon Edge ở chế độ phát triển, được giải thích trong phần [Lệnh CLI](/docs/edge/get-started/cli-commands), hãy chạy lệnh sau:
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Bước 3: Truy vấn số dư tài khoản {#step-3-query-the-account-balance}

Bây giờ máy khách đã thiết lập và chạy ở chế độ nhà phát triển, bằng cách sử dụng tệp tin genesis được tạo ở **bước 1**, chúng ta có thể sử dụng một công cụ như **curl** để truy vấn số dư tài khoản:
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

Lệnh sẽ trả về kết quả đầu ra sau đây:
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Bước 4: Gửi giao dịch chuyển khoản {#step-4-send-a-transfer-transaction}

Bây giờ đã xác nhận tài khoản mà chúng ta thiết lập như tài khoản định trước có số dư chính xác, chúng ta có thể chuyển một số ether:

````js
var Web3 = require("web3");

const web3 = new Web3("<provider's websocket jsonrpc address>"); //example: ws://localhost:10002/ws
web3.eth.accounts
  .signTransaction(
    {
      to: "<recipient address>",
      value: web3.utils.toWei("<value in ETH>"),
      gas: 21000,
    },
    "<private key from premined account>"
  )
  .then((signedTxData) => {
    web3.eth
      .sendSignedTransaction(signedTxData.rawTransaction)
      .on("receipt", console.log);
  });

````
