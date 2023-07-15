---
id: troubleshooting
title: 문제 해결
description: "Polygon 엣지의 문제 해결 섹션입니다."
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# 문제 해결 {#troubleshooting}

## `method=eth_call err="invalid signature"` 오류 {#error}

Polygon 엣지에서 트랜잭션에 지갑을 사용하는 경우, 지갑의 로컬 네트워크가 다음과 같이 설정되어 있는지 확인하세요.

1. `chainID`가 올바른지 확인합니다. 엣지의 기본 `chainID`는 `100`이지만, 제네시스 플래그 `--chain-id`를 사용하여 원하는 대로 변경할 수 있습니다.

````bash
genesis [--chain-id CHAIN_ID]
````
2. 'RPC URL' 필드에서 연결하려는 대상 노드의 JSON RPC 포트를 사용하는지 확인합니다.


## 웹소켓 URL을 가져오는 방법 {#how-to-get-a-websocket-url}

기본적으로 Polygon 엣지를 실행할 때는 체인 위치를 기반으로 웹소켓 엔드포인트가 노출됩니다.
HTTPS 링크에 사용되는 URL 스키마는 `wss://`, HTTP 링크의 경우 `ws://`입니다.

Localhost 웹소켓 URL은 다음과 같습니다.
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
포트 번호는 노드를 위해 선택한 JSON-RPC 포트에 따라 결정됩니다.

Edgenet 웹소켓 URL은 다음과 같습니다.
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## 계약 배포 시도 시 `insufficient funds` 오류 {#error-when-trying-to-deploy-a-contract}

이 오류가 표시되면 원하는 주소에 자금이 충분한지 그리고 사용된 주소가 정확한지 확인합니다.<br/>
사전 채굴된 잔액을 설정하려면 제네시스 파일을 생성할 때 제네시스 플래그 `genesis [--premine ADDRESS:VALUE]`를 사용할 수 있습니다.
이 플래그를 사용한 예는 다음과 같습니다.
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
이 플래그가 1000000000000000000000WEI를 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862에 사전 채굴합니다.


## ChainBridge 사용 시 ERC20 토큰이 해제되지 않는 경우 {#erc20-tokens-not-released-while-using-chainbridge}

Polygon PoS와 로컬 엣지 네트워크 간에 ERC20 토큰을 이전하려는 경우, ERC20 토큰이 입금되고 제안도 릴레이어에서 실행되지만 토큰이 엣지 네트워크에서 해제되지 않으면 Polygon 엣지 체인의 ERC20 핸들러에 해제할 토큰이 충분한지 확인하세요. <br/>
대상 체인의 핸들러 계약에는 잠금-해제 모드를 위한 토큰이 충분해야 합니다. 로컬 엣지 네트워크의 ERC20 핸들러에 ERC20 토큰이 전혀 없으면 새 토큰을 발행하여 ERC20 핸들러로 이전하세요.

## ChainBridge 사용 시 `Incorrect fee supplied` 오류 {#error-when-using-chainbridge}

Mumbai Polygon PoS 체인과 로컬 Polygon 엣지 설정 간에 ERC20 토큰을 이전하려는 경우에 이 오류가 발생할 수 있습니다. `--fee` 플래그를 사용하여 배포에 대한 비용을 설정할 때 입금 트랜잭션에 동일한 값을 설정하지 않으면 이런 오류가 나타납니다.
아래 명령어를 사용하여 요금을 변경할 수 있습니다.
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
[여기에서](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md) 이 국기에 대한 자세한 정보를 확인할 수 있습니다.





