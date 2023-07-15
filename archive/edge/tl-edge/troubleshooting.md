---
id: troubleshooting
title: Pag-troubleshoot
description: "Seksyong Pag-troubleshoot para sa Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Pag-troubleshoot {#troubleshooting}

## `method=eth_call err="invalid signature"` ng error {#error}

Kapag gumagamit ka ng wallet para gumawa ng transaksyon sa Polygon Edge, tiyakin na sa setup ng lokal na network ng iyong wallet:

1. Ang `chainID` ay ang tama Ang default na `chainID` para sa Edge ay `100`, ngunit maaari itong i-customize gamit ang genesis flag na `--chain-id`.

````bash
genesis [--chain-id CHAIN_ID]
````
2. Tiyakin na sa “RPC URL” field, ginagamit mo ang JSON RPC port ng node kung saan ka kumokonekta.


## Paano makakuha ng WebSocket URL {#how-to-get-a-websocket-url}

Bilang default, kapag pinatakbo mo ang Polygon Edge, nagpapakita ito ng WebSocket endpoint batay sa lokasyon ng chain.
Ang URL scheme na `wss://` ay ginagamit para sa mga HTTPS link, at `ws://` para sa HTTP.

Localhost WebSocket URL:
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Mangyaring tandaan na ang port number ay nakadepende sa napiling JSON-RPC port para sa node.

Edgenet WebSocket URL:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## `insufficient funds` error kapag sinusubukang mag-deploy ng kontrata {#error-when-trying-to-deploy-a-contract}

Kung makakaranas ka ng ganitong error, mangyaring tiyakin na mayroon kang sapat na mga pondo sa gustong address, at ang address na ginagamit ay ang tamang address.<br/>
Para maitakda ang premined na balanse, maaari mong gamitin ang genesis flag na `genesis [--premine ADDRESS:VALUE]` habang binubuo ang genesis file.
Halimbawa ng paggamit ng flag na ito:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Nagpi-premine ito ng 1000000000000000000000 WEI sa 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862.


## Hindi inire-release ang mga ERC20 token habang ginagamit ang Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

Kung susubukan mong maglipat ng mga ERC20 token sa pagitan ng Polygon POS at isang lokal na Edge network, at naideposito ang iyong mga ERC20 token, at naisagawa ang proposal sa relayer, ngunit hindi na-release ang mga token sa iyong Edge network, mangyaring tiyakin na ang ERC20 Handler sa Polygon Edge chain ay may sapat na mga token na maire-release. <br/>
Ang kontrata ng Handler sa destination na chain ay mayroon dapat sapat na mga token na maire-release para sa lock-release mode. Kung wala kang anumang ERC20 token sa ERC20 Handler ng iyong lokal na Edge network, mag-mint ng mga bagong token at ilipat ang mga ito sa ERC20 Handler.

## `Incorrect fee supplied` error kapag ginagamit ang Chainbridge {#error-when-using-chainbridge}

Maaari kang makaranas ng ganitong error kapag sinusubukang maglipat ng mga ERC20 token sa pagitan ng Mumbai Polygon POS chain at isang lokal na setup ng Polygon Edge. Lumalabas ang ganitong error kapag itinakda mo ang bayad sa pag-deploy gamit ang `--fee` flag, ngunit hindi mo itinakda ang parehong value sa deposit na transaksyon.
Maaari mong gamitin ang command sa ibaba para baguhin ang bayad:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Makakahanap ka ng karagdagang impormasyon tungkol sa bandilang ito [dito](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md).





