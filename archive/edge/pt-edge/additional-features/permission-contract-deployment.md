---
id: permission-contract-deployment
title: Permissão para implantação de contratos inteligentes
description: Como adicionar a permissão para implantação de contratos inteligentes.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Visão geral {#overview}

Este guia indica, em detalhe, como criar uma lista de permissões de endereços que podem implantar contratos inteligentes.
Por vezes, os operadores de rede pretendem evitar que os utilizadores implantem contratos inteligentes que não estejam relacionados com o propósito da rede. Os operadores de rede podem:

1. Incluir endereços na lista de permissões para implantação de contratos inteligentes
2. Remover os endereços da lista de permissões para implantação de contratos inteligentes

## Apresentação de vídeo {#video-presentation}

[![implantação do contrato de permissão](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Como usá-la? {#how-to-use-it}


Encontra todos os comandos cli relacionados com a lista de permissões de implantação na página [Comandos CLI](/docs/edge/get-started/cli-commands#whitelist-commands).

* `whitelist show`: Mostra informações da lista de permissões
* `whitelist deployment --add`:  Adiciona um endereço novo à lista de permissões de implantação de contratos
* `whitelist deployment --remove`:  Remove um endereço novo da lista de permissões de implantação de contratos

#### Mostrar todos os endereços na lista de permissões de implantação {#show-all-addresses-in-the-deployment-whitelist}

Existem 2 maneiras de encontrar endereços na lista de permissões de implantação.
1. Procurar na `genesis.json` onde as listas de permissões são guardadas
2. Executar `whitelist show`, que imprime informação para todas as listas de permissões suportadas pelo Polygon Edge

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Adicionar um endereço à lista de permissões de implantação {#add-an-address-to-the-deployment-whitelist}

Para adicionar um endereço novo à lista de permissões de implantação, execute o comando CLI `whitelist deployment --add [ADDRESS]`. Não há limite para o número de endereços presentes na lista de permissões. Os contratos só podem ser implantados pelos endereços que constam da lista de permissões de implantação. Se a lista de permissões estiver vazia, qualquer endereço poderá efetuar a implantação

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Remover um endereço da lista de permissões de implantação {#remove-an-address-from-the-deployment-whitelist}

Para remover um endereço da lista de permissões de implantação, execute o comando CLI `whitelist deployment --remove [ADDRESS]`. Os contratos só podem ser implantados pelos endereços que constam da lista de permissões de implantação. Se a lista de permissões estiver vazia, qualquer endereço poderá efetuar a implantação

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```
