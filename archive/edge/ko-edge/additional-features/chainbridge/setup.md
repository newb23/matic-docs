---
id: setup
title: 설정
description: chainBridge 설정 방법
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## 계약 배포 {#contracts-deployment}

이 섹션에서는 `cb-sol-cli`를 사용하여 필요한 계약을 Polygon PoS 및 Polygon 엣지 체인에 배포합니다.

```bash
# Setup for cb-sol-cli command
$ git clone https://github.com/ChainSafe/chainbridge-deploy.git
$ cd chainbridge-deploy/cb-sol-cli
$ make install
```

먼저 `cb-sol-cli deploy` 명령어로 Polygon PoS 체인에 계약을 배포합니다. 명령어에 `--all` 플래그를 사용하면 브리지, ERC20 핸들러, ERC721 핸들러, 일반 핸들러, ERC20 및 ERC721 계약을 포함한 모든 계약을 배포할 수 있습니다. 또한, 기본 릴레이어 계정 주소 및 임계값을 설정합니다.

```bash
# Deploy all required contracts into Polygon PoS chain
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --gasPrice [GAS_PRICE] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```


체인 ID와 JSON-RPC URL에 관한 정보는 [여기](/docs/edge/additional-features/chainbridge/definitions)를 참조하세요.

:::caution

`cb-sol-cli`에서 기본 가스 가격은 `20000000`(`0.02 Gwei`)입니다. 트랜잭션에 적절한 가스 가격을 설정하려면 `--gasPrice` 인수를 사용하여 값을 설정하세요.

```bash
$ cb-sol-cli deploy --all --chainId 99 \
  --url https://rpc-mumbai.matic.today \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1 \
  # Set gas price to 5 Gwei
  --gasPrice 5000000000
```

:::

:::caution

브리지 계약은 배포에 약 0x3f97b8(4167608) 가스를 사용합니다. 생성 중인 블록이 계약 생성 트랜잭션을 포함할 수 있는 충분한 블록 가스 한도를 가지고 있는지 확인하세요. Polygon 엣지에서 블록 가스 한도를 변경하는 방법에 대해 자세히 알아보려면
[로컬 설정](/docs/edge/get-started/set-up-ibft-locally)을 확인하세요.

:::

계약이 배포되면 다음 결과가 표시됩니다.

```bash
Deploying contracts...
✓ Bridge contract deployed
✓ ERC20Handler contract deployed
✓ ERC721Handler contract deployed
✓ GenericHandler contract deployed
✓ ERC20 contract deployed
WARNING: Multiple definitions for safeTransferFrom
✓ ERC721 contract deployed

================================================================
Url:        https://rpc-mumbai.matic.today
Deployer:   <ADMIN_ACCOUNT_ADDRESS>
Gas Limit:   8000000
Gas Price:   20000000
Deploy Cost: 0.00029065308

Options
=======
Chain Id:    <CHAIN_ID>
Threshold:   <RELAYER_THRESHOLD>
Relayers:    <RELAYER_ACCOUNT_ADDRESS>
Bridge Fee:  0
Expiry:      100

Contract Addresses
================================================================
Bridge:             <BRIDGE_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20 Handler:      <ERC20_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721 Handler:     <ERC721_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Generic Handler:    <GENERIC_HANDLER_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc20:              <ERC20_CONTRACT_ADDRESS>
----------------------------------------------------------------
Erc721:             <ERC721_CONTRACT_ADDRESS>
----------------------------------------------------------------
Centrifuge Asset:   Not Deployed
----------------------------------------------------------------
WETC:               Not Deployed
================================================================
```

이제 Polygon 엣지 체인에 계약을 배포할 수 있습니다.

```bash
# Deploy all required contracts into Polygon Edge chain
$ cb-sol-cli deploy --all --chainId 100 \
  --url http://localhost:10002 \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --relayers [RELAYER_ACCOUNT_ADDRESS] \
  --relayerThreshold 1
```

다음 단계에 필요하므로, 배포된 스마트 계약 주소가 표시된 터미널 출력을 저장하세요.

## 릴레이어 설정 {#relayer-setup}

이 섹션에서는 2개 체인 사이에서 데이터를 교환하는 릴레이어를 시작합니다.

우선, ChainBridge 저장소를 복제하고 빌드해야 합니다.

```bash
$ git clone https://github.com/ChainSafe/ChainBridge.git
$ cd chainBridge && make install
```

그다음, `config.json`을 생성하고 각 체인에 JSON-RPC URL, 릴레이어 주소 및 계약 주소를 설정해야 합니다.

```json
{
  "chains": [
    {
      "name": "mumbai",
      "type": "ethereum",
      "id": "99",
      "endpoint": "https://rpc-mumbai.matic.today",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    },
    {
      "name": "polygon-edge",
      "type": "ethereum",
      "id": "100",
      "endpoint": "http://localhost:10002",
      "from": "<RELAYER_ACCOUNT_ADDRESS>",
      "opts": {
        "bridge": "<BRIDGE_CONTRACT_ADDRESS>",
        "erc20Handler": "<ERC20_HANDLER_CONTRACT_ADDRESS>",
        "erc721Handler": "<ERC721_HANDLER_CONTRACT_ADDRESS>",
        "genericHandler": "<GENERIC_HANDLER_CONTRACT_ADDRESS>",
        "minGasPrice": "1",
        "http": "true"
      }
    }
  ]
}
```

릴레이어를 시작하려면, 릴레이어 계정 주소에 해당하는 비공개 키를 가져와야 합니다. 비공개 키를 가져올 때 비밀번호를 입력해야 합니다. 가져오기에 성공하면, `keys/<ADDRESS>.key` 아래에 키가 저장됩니다.

```bash
# Import private key and store to local with encryption
$ chainbridge accounts import --privateKey [RELAYER_ACCOUNT_PRIVATE_KEY]

INFO[11-19|07:09:01] Importing key...
Enter password to encrypt keystore file:
> [PASSWORD_TO_ENCRYPT_KEY]
INFO[11-19|07:09:05] private key imported                     address=<RELAYER_ACCOUNT_ADDRESS> file=.../keys/<RELAYER_ACCOUNT_ADDRESS>.key
```

이제 릴레이어를 시작할 수 있습니다. 처음 키 저장 시 선택했던 것과 동일한 비밀번호를 입력해야 합니다.

```bash
# Start relayer
$ chainbridge --config config.json --latest

INFO[11-19|07:15:19] Starting ChainBridge...
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:25] Connecting to ethereum chain...          chain=mumbai url=<JSON_RPC_URL>
Enter password for key ./keys/<RELAYER_ACCOUNT_ADDRESS>.key:
> [PASSWORD_TO_DECRYPT_KEY]
INFO[11-19|07:15:31] Connecting to ethereum chain...          chain=polygon-edge url=<JSON_RPC_URL>
```

릴레이어가 시작되면 각 체인의 새로운 블록을 확인하기 시작할 것입니다.
