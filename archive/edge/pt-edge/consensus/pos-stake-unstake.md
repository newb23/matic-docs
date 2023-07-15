---
id: pos-stake-unstake
title: Configure e use Proof of Stake (PoS)
description: "Stake, unstake e outras instruções relacionadas a staking."
keywords:
  - docs
  - polygon
  - edge
  - stake
  - unstake
  - validator
  - epoch
---

## Visão geral {#overview}

Este guia detalha como configurar a rede Proof of Stake com o Polygon Edge e como fazer staking de fundos para nós
para se tornarem validadores e como cancelar o staking de fundos.

É **altamente encorajado** a ler e passar por [Configuração Local](/docs/edge/get-started/set-up-ibft-locally) / [Configurações de Nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud), antes de seguir o caminho
com este guia de PoS. Essas seções descrevem as etapas necessárias para iniciar um cluster de Prova de Autoridade (PoA) com o
Polygon Edge.

Atualmente, não há limite no número de validadores que podem fazer staking de fundos no Contrato Inteligente de Staking.

## Contrato Inteligente de Staking {#staking-smart-contract}

O repositório para o Contrato Inteligente de Staking está localizado [aqui](https://github.com/0xPolygon/staking-contracts).

Ele mantém os scripts de teste necessários, os arquivos ABI e, principalmente, o próprio Contrato Inteligente de Staking.

## Como configurar um cluster de nó N {#setting-up-an-n-node-cluster}

Como configurar uma rede com Polygon Edge está coberto nas seções
[Configuração Local](/docs/edge/get-started/set-up-ibft-locally) / [Configurações de Nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud).

A **única diferença** entre configurar um cluster de PoS e PoA é a geração de génese.

**Ao gerar o ficheiro de génese para um cluster de PoS, é necessário um sinalizador adicional`--pos`**:

```bash
polygon-edge genesis --pos ...
```

## Como definir o comprimento de uma epoch {#setting-the-length-of-an-epoch}

As epochs são cobertas em detalhes na seção [Blocos de Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks).

Para definir o tamanho de uma epoch para um cluster (em blocos), ao gerar o ficheiro de génese, um sinalizador adicional
é especificado `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50
```

Este valor especificou no ficheiro de génese que o tamanho da epoch deve ser de `50` blocos.

O valor padrão para o tamanho de uma epoch (em blocos) é `100000`.

:::info Redução do comprimento da epoch

Como descrito na seção [Blocos da epoch](/docs/edge/consensus/pos-concepts#epoch-blocks),
os blocos da epoch são usados para atualizar os conjuntos de validadores para nós.

O comprimento de epoch padrão nos blocos (`100000`) pode ser um tempo longo para as atualizações de conjunto de validadores. Considerando que os novos
blocos são adicionados a cada 2 segundos aproximadamente, seriam necessárias ~55,5 horas para que o conjunto de validadores possa mudar.

A configuração de um valor mais baixo para o comprimento da epoch garante que o conjunto de validadores seja atualizado com mais frequência.

:::

## Como usar os scripts do Contrato Inteligente de Staking {#using-the-staking-smart-contract-scripts}

### Pré-requisitos {#prerequisites}

Os repositórios de Contrato Inteligente de Staking são um projeto Hardhat, que requer NPM.

Para inicializá-lo corretamente, no principal diretório, execute:

```bash
npm install
````

### Configuração dos scripts de ajuda fornecidos {#setting-up-the-provided-helper-scripts}

Os scripts para interagir com o Contrato Inteligente de Staking implantado estão localizados no
repositório do [Contrato Inteligente de Staking](https://github.com/0xPolygon/staking-contracts).

Crie um ficheiro `.env` com os seguintes parâmetros na localização do repositório do Contrato Inteligente:

```bash
JSONRPC_URL=http://localhost:10002
PRIVATE_KEYS=0x0454f3ec51e7d6971fc345998bb2ba483a8d9d30d46ad890434e6f88ecb97544
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
BLS_PUBLIC_KEY=0xa..
```

Onde os parâmetros estão:

* **JSONRPC_URL** - o endpoint JSON-RPC para o nó em execução
* **PRIVATE_KEYS** - chaves privadas do endereço de staking.
* **STAKING_CONTRACT_ADDRESS** - endereço do contrato inteligente de staking (
padrão `0x0000000000000000000000000000000000001001`)
* **BLS_PUBLIC_KEY** - chave pública de BLS do staker. Só é necessária se a rede estiver a ser executada com BLS

### Fundos de staking {#staking-funds}

:::info Endereço de staking

O Contrato Inteligente de Staking é pré-implantado no
endereço `0x0000000000000000000000000000000000001001`.

Qualquer tipo de interação com o mecanismo de staking é feito através de Contrato Inteligente de Staking no endereço especificado.

Para saber mais sobre o Contrato Inteligente de Staking, visite
o **[Contrato Inteligente de Estaca](/docs/edge/consensus/pos-concepts#contract-pre-deployment)** .

:::

Para ser parte do conjunto de validadores, o endereço precisa fazer staking de um determinado valor de fundos acima de um limiar.

Atualmente, o limiar padrão para se tornar parte do conjunto de validadores é `1 ETH`.

O staking pode ser iniciado chamando o `stake` método do Contrato Inteligente de Staking, e especificando um valor `>= 1 ETH`.

Depois do ficheiro `.env` mencionado na
a [seção anterior](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) foi configurada e uma
cadeia foi iniciada no modo PoS, o staking pode ser feito com o seguinte comando no repositório de Contrato Inteligente de Staking:

```bash
npm run stake
```

O script do `stake` Hardhat faz staking de um valor padrão de `1 ETH`, que pode ser alterado modificando-se o ficheiro `scripts/stake.ts`
.

Se os fundos de staking forem `>= 1 ETH`, o conjunto de validadores no Contrato Inteligente de Staking é atualizado, e o endereço
será parte do conjunto de validadores a partir da próxima epoch.

:::info Registro de chaves de BLS
Se a rede estiver a ser executada no modo BLS, para que os nós se tornem validadores, eles precisam registrar suas chaves públicas de BLS após o staking

Isso pode ser realizado com o seguinte comando:

```bash
npm run register-blskey
```
:::

### Fundos de cancelamento de staking {#unstaking-funds}

Os endereços que têm um staking só ** podem cancelar os stakings de todos os seus fundos** uma única vez.

Depois do ficheiro `.env` mencionado na
[seção anterior](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
ter sido configurado e um chain ter sido iniciado no modo PoS, o cancelamento de staking pode ser feito com o seguinte comando no
repositório de Contrato Inteligente de Staking:

```bash
npm run unstake
```

### Como obter a lista de stakers {#fetching-the-list-of-stakers}

Todos os endereços que fazem staking de fundos são salvos no Contrato Inteligente de Staking.

Depois do ficheiro `.env` mencionado na
[seção anterior](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts)
ter sido configurado e a chain ter iniciado no modo PoS, a a lista de validadores pode ser obtida com o
seguinte comando no repositório do Contrato Inteligente de Staking:

```bash
npm run info
```
