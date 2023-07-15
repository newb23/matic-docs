---
id: troubleshooting
title: Dépannage
description: "Section de dépannage pour Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - troubleshooting

---

# Dépannage {#troubleshooting}

## `method=eth_call err="invalid signature"` erreur {#error}

Lorsque vous utilisez un portefeuille pour effectuer une transaction avec Polygon Edge, assurez-vous que c'est dans la configuration du réseau local de votre portefeuille:

1. Le `chainID` est le bon. La défaillance `chainID` pour Edge est `100`, mais elle peut être personnalisée en utilisant l'indicateur de genèse `--chain-id`.

````bash
genesis [--chain-id CHAIN_ID]
````
2. Assurez-vous que dans le champ « URL RPC », vous utilisez le port RPC JSON du nœud auquel vous vous connectez.


## Comment obtenir une URL WebSocket {#how-to-get-a-websocket-url}

Par défaut, lorsque vous exploitez le Polygon Edge, il génère un point de terminaison WebSocket basé sur l'emplacement de la chaîne. Le schéma d'URL `wss://` est utilisé pour les liens HTTPS, et `ws://` HTTP.

URL de WebSocket de l'hôte local :
````bash
ws://<JSON-RPC URL>:<PORT>/ws
````
Veuillez noter que le numéro de port dépend du port JSON-RPC choisi pour le nœud.

URL Edgenet WebSocket:
````bash
wss://rpc-edgenet.polygon.technology/ws
````

## `insufficient funds` erreur lors du déploiement d'un contrat {#error-when-trying-to-deploy-a-contract}

Si vous obtenez cette erreur, veuillez vous assurer que vous avez suffisamment de fonds sur l'adresse souhaitée, et que l'adresse utilisée est la bonne.<br/>
Pour définir l'équilibre prédominé, vous pouvez utiliser l'indicateur de genèse `genesis [--premine ADDRESS:VALUE]` lors de la génération du fichier de genèse.
Exemple d'utilisation de cet indicateur:
````bash
genesis --premine 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
````
Cela permet de préminer 1000000000000000000000 WEI à 0x3956E90e632AEbBF34DEB49b71c28A83Bc029862.


## Jetons ERC20 non libérés lors de l'utilisation de Chainbridge {#erc20-tokens-not-released-while-using-chainbridge}

Si vous essayez de transférer des jetons ERC20 entre POS de Polygon et un réseau Edge local, et que vos jetons ERC20 sont déposés, la proposition est également exécutée au relayer, mais les jetons ne sont pas libérés dans votre réseau Edge. Veuillez vous assurer que le gestionnaire ERC20 dans la chaîne de Polygon Edge a suffisamment de jetons à libérer. <br/>
Le contrat du gestionnaire dans la chaîne de destination doit avoir suffisamment de jetons pour être libéré pour le mode de déverrouillage. Si vous n'avez pas de jetons ERC20 dans le Gestionnaire ERC20 de votre réseau Edge local, veuillez créer de nouveaux jetons et les transférer au Gestionnaire ERC20.

## `Incorrect fee supplied` erreur lors de l'utilisation de Chainbridge {#error-when-using-chainbridge}

Vous pouvez obtenir cette erreur lorsque vous essayez de transférer des jetons ERC20 entre la chaîne POS de Polygon Mumbai et une configuration locale de Polygon Edge. Cette erreur apparaît lorsque vous définissez les frais de déploiement à l'aide de l'`--fee`indicateur, mais ne définissez pas la même valeur dans la transaction de dépôt.
Vous pouvez utiliser la commande ci-dessous pour modifier les frais:
````bash
 $ cb-sol-cli admin set-fee --bridge <BRIDGE_ADDRESS> --fee 0 --url <JSON_RPC_URL> --privateKey <PRIVATE_KEY>
 ````
Vous pouvez trouver plus d'informations sur ce drapeau [ici](https://github.com/ChainSafe/chainbridge-deploy/blob/main/cb-sol-cli/docs/deploy.md).





