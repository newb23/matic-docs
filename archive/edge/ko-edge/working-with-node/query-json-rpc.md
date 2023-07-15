---
id: query-json-rpc
title: JSON RPC 엔드포인트 쿼리
description: "데이터를 쿼리하고 사전 채굴된 계정으로 체인을 시작합니다."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## 개요 {#overview}

Polygon 엣지의 JSON-RPC 레이어 덕분에 개발자는 HTTP 요청을 통해 블록체인과 간편하게
상호작용할 수 있습니다.

이 예에는 **curl**과 같은 도구를 사용해 정보 쿼리, 사전 채굴된 계정으로 체인 시작,
트랜잭션 전송에 대해 다룹니다.

## 1단계: 사전 채굴된 계정으로 제네시스 파일 생성 {#step-1-create-a-genesis-file-with-a-premined-account}

제네시스 파일을 생성하려면 다음의 명령어를 실행하세요.
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

**사전 채굴** 플래그는 **제네시스** 파일에 초기 잔액과 함께 포함되어야 하는 주소를 설정합니다.<br />
이 경우 주소 `0x1010101010101010101010101010101010101010`에는 시작 **기본 잔액**
`0xD3C21BCECCEDA1000000`이 (100만 개의 네이티브 통화 토큰).

잔액을 지정하려는 경우에는 다음과 같이 `:`을 이용하여 잔액과 주소를 구분할 수 있습니다.
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

잔액은 `hex` 또는 `uint256` 값입니다.

:::warning 비공개 키가 있는 사전 채굴 계정만 가능!

사전 채굴 계정은 있지만 이에 액세스할 비공개 키가 없으면 사전 채굴된 잔액을 사용할 수 없습니다.

:::

## 2단계: Polygon 엣지를 개발 모드로 시작 {#step-2-start-the-polygon-edge-in-dev-mode}

Polygon 엣지를 [CLI 명령어](/docs/edge/get-started/cli-commands) 섹션에서 설명하는 개발 모드로 시작하려면
다음을 실행하세요.
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## 3단계: 계정 잔액 쿼리 {#step-3-query-the-account-balance}

이제 클라이언트가 **1단계**에서 생성된 제네시스 파일 통해 개발 모드에서 실행되고 있으므로
**curl**과 같은 도구를 사용하여 계정 잔액을 쿼리할 수 있습니다.
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

이 명령어는 다음과 같은 출력을 반환합니다.
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## 4단계: 이전 트랜잭션 전송 {#step-4-send-a-transfer-transaction}

이제 사전 채굴로 설정한 계정에 정확한 잔액이 있음을 확인했으니 이더를 이전할 수 있습니다.

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
