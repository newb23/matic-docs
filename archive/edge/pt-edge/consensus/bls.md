---
id: bls
title: BLS
description: "Explicação e instruções sobre o modo BLS."
keywords:
  - docs
  - polygon
  - edge
  - bls
---

## Visão geral {#overview}

BLS também conhecido como Boneh–Lynn–Shacham (BLS) é um esquema de assinatura criptográfica que permite que um usuário verifique se um signatário é autenticado. É um esquema de assinatura que pode agregar várias assinaturas. No Polygon Edge, o BLS é usado por defeito para fornecer melhor segurança no modo consenso do IBFT. BLS pode agregar assinaturas em um único array de byte único e reduzir o tamanho do cabeçalho de blocos. Cada chain pode escolher se quer usar o BLS ou não. A chave ECDSA é usada independentemente de o modo BLS estar habilitado ou não.

## Apresentação de vídeo {#video-presentation}

[![bls - vídeo](https://img.youtube.com/vi/HbUmZpALlqo/0.jpg)](https://www.youtube.com/watch?v=HbUmZpALlqo)

## Como configurar uma chain nova usando o BLS {#how-to-setup-a-new-chain-using-bls}

Consulte as seções [Configuração Local](/docs/edge/get-started/set-up-ibft-locally)/[Configuração na Nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud) para obter instruções de configuração detalhadas.

## Como migrar de uma chain de PoA de ECDSA existente para chain de PoA de BLS {#how-to-migrate-from-an-existing-ecdsa-poa-chain-to-bls-poa-chain}

Esta seção descreve como usar o modo BLS em uma chain de PoA existente.
as seguintes etapas são necessárias para habilitar o BLS em uma chain de PoA.

1. Pare todos os nós
2. Gere as chaves BLS para validadores
3. Adicione uma configuração de fork no genesis.json
4. Reinicie todos os nós

### 1. Pare todos os nós {#1-stop-all-nodes}

Encerre todos os processos dos validadores pressionando Ctrl + c (Control + c). Lembre-se da altura do último bloco (o maior número da sequência no registro de blocos comprometidos).

### 2. Gere a chave BLS {#2-generate-the-bls-key}

`secrets init` com o `--bls` gera uma chave do BLS. Para manter a chave de ECDSA e Rede, e adicionar uma nova chave de BLS, `--ecdsa` e `--network` precisam ser desabilitadas.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Adicione a configuração do fork {#3-add-fork-setting}

O comando `ibft switch` adiciona uma configuração do fork, que permite o BLS na chain existente, em `genesis.json`.

Para redes de PoA, os validadores precisam ser dados no comando. Como na forma do comando `genesis`, os sinalizadores `--ibft-validators-prefix-path` ou `--ibft-validator` podem ser usados para especificar o validador.

Especifique a altura a partir da qual a chain começa a usar o BLS com o sinalizador `--from`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoA --ibft-validator-type bls --ibft-validators-prefix-path test-chain- --from 100
```

### 4. Reinicie todos os nós {#4-restart-all-nodes}

Reinicie todos os nós pelo comando `server`. Depois que o bloco em `from` especificado na etapa anterior for criado, a chain habilita o BLS e mostra os registros como exibidos abaixo:

```bash
2022-09-02T11:45:24.535+0300 [INFO]  polygon.ibft: IBFT validation type switched: old=ecdsa new=bls
```

Os registros também mostram que modo de verificação é usado para gerar cada bloco após o bloco ser criado.

```
2022-09-02T11:45:28.728+0300 [INFO]  polygon.ibft: block committed: number=101 hash=0x5f33aa8cea4e849807ca5e350cb79f603a0d69a39f792e782f48d3ea57ac46ca validation_type=bls validators=3 committed=3
```

## Como migrar de uma chain de PoS de ECDSA existente para um chain de PoS de BLS {#how-to-migrate-from-an-existing-ecdsa-pos-chain-to-a-bls-pos-chain}

Esta seção descreve como usar o modo BLS em uma chain de PoS existente.
As seguintes etapas são necessárias para habilitar o BLS na chain de PoS.

1. Pare todos os nós
2. Gere as chaves BLS para validadores
3. Adicione uma configuração de fork no genesis.json
4. Chame o contrato de staking para registrar a chave pública do BLS
5. Reinicie todos os nós

### 1. Pare todos os nós {#1-stop-all-nodes-1}

Encerre todos os processos dos validadores pressionando Ctrl + c (Control + c). Lembre-se da altura do último bloco (o maior número da sequência no registro de blocos comprometidos).

### 2. Gere a chave BLS {#2-generate-the-bls-key-1}

`secrets init` com o `--bls`indicador gera a chave BLS. Para manter a chave ECDSA e Rede existentes, e adicionar uma nova chave BLS, `--ecdsa` e `--network` precisam ser desabilitadas.

```bash
polygon-edge secrets init --bls --ecdsa=false --network=false

[SECRETS INIT]
Public key (address) = 0x...
BLS Public key       = 0x...
Node ID              = 16...
```

### 3. Adicione a configuração do fork {#3-add-fork-setting-1}

O comando `ibft switch` adiciona uma configuração do fork, que habilita o BLS a partir do meio da chain, para `genesis.json`.

Especifique a altura a partir da qual a chain começa a usar o modo BLS com o indicador `from`, e a altura na qual o contrato é atualizado com o indicador `development`.

```bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type bls --deployment 50 --from 200
```

### 4. Registre a chave pública do BLS no contrato de staking {#4-register-bls-public-key-in-staking-contract}

Depois que o fork for adicionado e os validadores forem reiniciados, cada validador precisa chamar `registerBLSPublicKey` no contrato de staking para registrar a chave pública do BLS. Isso deve ser feito após a altura especificada em `--deployment` antes da altura especificada em `--from`.

O roteiro para registrar a Chave Pública do BLS é definido no [repositório de Contrato Inteligente de Staking](https://github.com/0xPolygon/staking-contracts).

Configure `BLS_PUBLIC_KEY` para ser registrado no ficheiro `.env`. Consulte o [pos-stake-unstake](/docs/edge/consensus/pos-stake-unstake#setting-up-the-provided-helper-scripts) para mais detalhes sobre outros parâmetros.

```env
JSONRPC_URL=http://localhost:10002
STAKING_CONTRACT_ADDRESS=0x0000000000000000000000000000000000001001
PRIVATE_KEYS=0x...
BLS_PUBLIC_KEY=0x...
```

O seguinte comando registra a chave pública do BLS fornecida em `.env` para o contrato.

```bash
npm run register-blskey
```

:::warning Os validadores precisam registrar a chave pública do BLS manualmente

No modo BLS, os validadores devem ter o seu próprio endereço e a chave pública do BLS. A camada de consenso ignora os validadores que não registraram a chave pública do BLS no contrato quando o consenso obtém informações do validador do contrato.

:::

### 5. Reinicie todos os nós {#5-restart-all-nodes}

Reinicie todos os nós pelo comando `server`. A chain habilita o BLS após o bloco em `from` especificado na etapa anterior ser criado.
