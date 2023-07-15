---
id: gas
title: Perguntas frequentes de gás
description: "Perguntas frequentes de gás para o Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Como fazer valer um preço de gás mínimo? {#how-to-enforce-a-minimum-gas-price}
Pode usar o sinalizador `--price-limit` fornecido no comando do servidor. Isso irá fazer valer o seu nó para aceitar apenas transações que tenham gás maior ou igual ao limiar de preço que definiu. Para garantir que ele seja aplicado na rede inteira, é preciso ter certeza de que todos os nós tenham o mesmo limiar de preços.


## Pode ter transações com taxas de gás de 0? {#can-you-have-transactions-with-0-gas-fees}
Sim, pode. O limiar de preços padrão que os nós impõem é `0`, o que significa que os nós aceitarão transações que tenham preço de gás definido em `0`.

## Como definir o fornecimento total de token de gás (nativo)? {#how-to-set-the-gas-native-token-total-supply}

Pode definir um saldo pré-minerado para as contas (endereços) usando o `--premine flag`. Observe que esta é uma configuração do ficheiro de génese, e não pode ser alterada posteriormente.

Exemplo de como usar o `--premine flag`:

`--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000`

Isso define um saldo pré-minerado de 1000 ETH para 0x3956E90e632AebBF34DEB49b71c28A83Bc029862 (o valor do argumento está em Wei).

O valor pré-minerado do token de gás será o fornecimento total. Nenhum outro valor da moeda nativa (token de gás) pode ser cunhado posteriormente.

## A borda oferece suporte a ERC-20 como token de gás? {#does-edge-support-erc-20-as-a-gas-token}

A borda não oferece suporte ao token de ERC-20 como token de gás. Apenas a moeda Edge nativa é compatível com gás.

## Como aumentar o limite de gás? {#how-to-increase-the-gas-limit}

Existem duas opções para aumentar o limite de gás no Polygon Edge:
1. Limpar a chain e aumentar `block-gas-limit`para valor máximo do uint64 no ficheiro da génese
2. Use o `--block-gas-target`sinalizador com um alto valor para aumentar o limite de gás de todos os nós. Isto requer reinicialização do nó. Explicação detalhada [aqui](/docs/edge/architecture/modules/txpool/#block-gas-target).