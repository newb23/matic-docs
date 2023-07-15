---
id: query-json-rpc
title: Requête des points de terminaison JSON RPC
description: "Interrogez les données et démarrez la chaîne avec un compte prédominé."
keywords:
  - docs
  - polygon
  - edge
  - query
  - premine
  - node
---

## Aperçu {#overview}

La couche JSON-RPC de Polygon Edge offre aux développeurs la fonctionnalité d'interagir facilement avec la blockchain,
via des requêtes HTTP.

Cet exemple couvre l'utilisation d'outils tels que le **curl** pour interroger des informations, ainsi que le démarrage de la chaîne avec un compte prédominé,
et l'envoi d'une transaction.

## Étape 1 : Créez un fichier de genèse avec un compte prédominé {#step-1-create-a-genesis-file-with-a-premined-account}

Pour générer un fichier de genèse, exécutez la commande suivante :
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010
````

L'indicateur **préminé** définit l'adresse qui doit être incluse avec un solde de départ dans le fichier **genèse**.<br />
Dans ce cas, l'adresse `0x1010101010101010101010101010101010101010` aura un **solde par défaut** de départ de
`0xD3C21BCECCEDA1000000`(1 million de jetons de monnaie native).

Si nous souhaitons spécifier un solde, nous pouvons séparer le solde et indiquer un `:`, comme ceci :
````bash
polygon-edge genesis --premine 0x1010101010101010101010101010101010101010:0x123123
````

Le solde peut être soit une valeur `hex`, soit une valeur `uint256`.

:::warning Faîtes seulement le premine des comptes pour lesquels vous disposez d'une clé privée!

Si vous préminez des comptes et que vous n'avez pas de clé privée pour y accéder, votre solde préminé ne sera pas utilisable

:::

## Étape 2 : Démarrez Polygon Edge en mode dev {#step-2-start-the-polygon-edge-in-dev-mode}

Pour démarrer Polygon Edge en mode de développement, ce qui est expliqué dans la section [CLI Commands](/docs/edge/get-started/cli-commands),
exécutez les opérations suivantes :
````bash
polygon-edge server --chain genesis.json --dev --log-level debug
````

## Étape 3 : Interrogez le solde du compte {#step-3-query-the-account-balance}

Maintenant que le client est opérationnel en mode dev, en utilisant le fichier de genèse généré à l'**étape 1**, nous pouvons utiliser un outil tel que

**curl** pour interroger le solde du compte :
````bash
curl -X POST --data '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0x1010101010101010101010101010101010101010", "latest"],"id":1}' localhost:8545
````

La commande doit renvoyer le résultat suivant :
````bash
{
  "id":1,
  "result":"0x100000000000000000000000000"
}
````

## Étape 4 : Envoyez une transaction de transfert {#step-4-send-a-transfer-transaction}

Maintenant que nous avons confirmé que le compte que nous avons configuré pour préminer a le bon solde, nous pouvons transférer un peu d'éther :

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
