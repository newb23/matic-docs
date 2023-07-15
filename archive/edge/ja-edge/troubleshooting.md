---
id: troubleshooting
title: トラブルシューティング
description: "Polygon Edgeのトラブルシューティングセクション"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# トラブルシューティング {#troubleshooting}

## `method=eth_call err="invalid signature"`エラー {#error}

Polygon Edgeでウォレットを使用してトランザクションを行う時は、ウォレットのローカルネットワーク設定で以下を確実に行ってください：

1. `chainID`が正しいものである。Edgeのデフォルト`chainID`は`100`ですが、ジェネシスフラグ`--chain-id`を利用してカスタマイズすることができます。

````bash
genesis [--chain-id CHAIN_ID]
````
2. 「RPC URL」で、接続するノードのJSON RPCポートを使用するフィールドを確認してください。


## WebSocketのURLを取得する方法 {#how-to-get-a-websocket-url}

デフォルトでは、Polygon Edgeを実行するとチェーン位置に基づいてWebSocketエンドポイントが公開されます。URLスキーム`wss://`がHTTPSリンク用に、`ws://`がHTTP用に使用されます。

ローカルホストWebSocketのURL：
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
ポート番号は、ノードに選択されたJSON-RPCポートによって異なることに注意してください。

Edgenet WebSocket URL：
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## コントラクトをデプロイしようとしている時の`insufficient funds`エラー {#error-when-trying-to-deploy-a-contract}

このエラーが発生した場合、望むアドレスに十分なファンドがあること、および使用されているアドレスが正しいことを確認してください。<br/>
前払い残高を設定するには、ジェネシスフラグ`genesis [--premine ADDRESS:VALUE]`を利用し、ジェネシスファイルを生成します。このフラグを使用する例：
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
これは1000000000000000000000WEIを0x3956E90e632AEbBF34DEB49b71c28A83Bc029862に前払いします。


## Chainbridgeを使用中ERC20トークンがリリースされない {#erc20-tokens-not-released-while-using-chainbridge}

Polygon PoSとローカルのEdgeネットワークとの間でERC20トークンを転送しようとして、ERC20トークンを預け入れ、提案もリレイヤーで実行しますが、トークンはEdgeネットワークにリリースされない場合、Polygon EdgeチェーンのERC20ハンドラにリリースするのに十分なトークンがあることを確認してください。<br/>
送信先チェーンのハンドラコントラクトではロックリリースモードのためにリリースするのに十分なトークンが必要です。ローカルEdgeネットワークのERC20ハンドラに全くERC20トークンがない場合、新しいトークンをミントし、それをERC20ハンドラに転送してください。

## Chainbridgeを使用する時の`Incorrect fee supplied`エラー {#error-when-using-chainbridge}

このエラーはMumbai Polygon PoSチェーンとローカルPolygon Edge設定の間でERC20トークンを転送しようとする時に発生する可能性があります。このエラーが表示されるのは、`--fee`フラグを使用してデプロイする際の手数料を設定するものの、デポジットトランザクションでは同じ値を設定していない時です。下記のコマンドを使用して手数料を変更できます：
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
このフラグについての詳細は[こちら](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md)をご覧ください。





