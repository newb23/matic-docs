---
id: definitions
title: Definições gerais
description: Definições gerais para termos usados na ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Relayer {#relayer}
A Chainbridge é uma bridge tipo relayer. O papel de um relayer consiste em votar a execução de uma solicitação (quantos tokens queimar/emitir, por exemplo).
Monitoriza eventos de todas as chains e vota a favor de uma proposta no contrato Bridge da chain de destino quando recebe um evento `Deposit` de uma chain. Um relayer chama um método no contrato Bridge para executar a proposta depois de ter sido apresentado o número necessário de votos. A bridge delega a execução no contrato Handler.


## Tipos de contratos {#types-of-contracts}
Na ChainBridge, existem três tipos de contratos em cada chain, denominados Bridge/Handler/Target.

| **Tipo** | **Descrição** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Contrato Bridge | Em cada chain é necessário implantar um contrato Bridge que gere solicitações, votos e execuções. Os utilizadores solicitam o `deposit` na Bridge para iniciar uma transferência e a Bridge delega o processo no contrato Handler correspondente ao contrato Target. Assim que o contrato Handler tiver conseguido chamar o contrato Target, o contrato Bridge emite um evento de `Deposit` para notificar os relayers. |
| Contrato Handler | Este contrato interage com o contrato Target para executar um depósito ou proposta. Valida a solicitação do utilizador, chama o contrato Target e ajuda com algumas definições para o contrato Target. Existem certos contratos Handler para chamar cada contrato Target que tenha uma interface diferente. As chamadas indiretas pelo contrato Handler fazem com que a bridge viabilize a transferência de qualquer tipo de ativos ou dados. Atualmente, a ChainBridge implementa três tipos de contratos Handler: ERC20Handler, ERC721Handler e GenericHandler. |
| Contrato Target | Contrato que gere os ativos a serem trocados ou as mensagens transferidas entre chains. A interação com este contrato será feita a partir de cada sidechain da bridge. |

<div style={{textAlign: 'center'}}>

![Arquitetura da ChainBridge](/img/edge/chainbridge/architecture.svg)
*Arquitetura da ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![Fluxo de trabalho para transferência de tokens ERC-20](/img/edge/chainbridge/erc20-workflow.svg)
*ex.: fluxo de trabalho para transferência de um token ERC-20*

</div>

## Tipos de contas {#types-of-accounts}

Antes de começar, certifique-se de que as contas têm uma quantidade suficiente de tokens nativos para criar transações. No Polygon Edge, pode atribuir saldos pré-minerados às contas ao gerar o bloco de génese.

| **Tipo** | **Descrição** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Admin | A esta conta será atribuído, por defeito, o papel de administrador. |
| User | Conta do remetente/destinatário que envia/recebe ativos. A conta do remetente paga as taxas de gás ao aprovar a transferência de tokens e solicitar o depósito no contrato Bridge para iniciar uma transferência. |

:::info O papel de administrador

Determinadas ações só podem ser executadas pela conta com funções de administrador. Por defeito, o implementador do contrato Bridge assume o papel de administrador. Pode ver abaixo como atribuir o papel de administrador a outra conta ou como o remover.

### Add admin role {#add-admin-role}

Adiciona um administrador

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Revoke admin role {#revoke-admin-role}

Remove um administrador

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## As operações permitidas pela conta de `admin` são indicadas abaixo. {#account-are-as-below}

### Definir um recurso {#set-resource}

Registe a identificação de um recurso com um endereço de contrato para um handler.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Tornar um contrato queimável/minerável {#make-contract-burnable-mintable}

Defina o contrato de um token como minerável/queimável num handler.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Cancelar proposta {#cancel-proposal}

Cancele a proposta para execução

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### Pausar/Anular pausa {#pause-unpause}

Pause temporariamente depósitos, a criação de propostas, a votação e a execução de depósitos.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Alterar taxa {#change-fee}

Altere a taxa que será paga ao contrato Bridge

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Adicionar/Remover um relayer {#add-remove-a-relayer}

Adicione uma conta como novo relayer ou remova uma conta dos relayers

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Alterar limite do relayer {#change-relayer-threshold}

Altere o número de votos necessários para a execução de uma proposta

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## ID da chain {#chain-id}

A `chainId`da Chainbridge é um valor arbitrário usado na bridge para fazer a distinção entre as redes blockchain e tem de estar no intervalo de uint8. Não deve ser confundida com a ID da chain da rede; não são a mesma coisa. Este valor tem de ser exclusivo, mas não tem de ser o mesmo que a identificação da rede.

Neste exemplo, definimos  `99` na `chainId`, porque a identificação da chain do testnet Mumbai é `80001`, o qual não pode ser representado com um uint8.

## ID do recurso {#resource-id}

A identificação do recurso é um valor exclusivo de 32 bytes num ambiente cross-chain, associado a um determinado ativo (recurso) que está a ser transferido entre redes.

A identificação do recurso é arbitrária, mas, como convenção, geralmente o último byte contém a identificação da chain de origem (a rede que deu origem a este ativo).

## URL JSON-RPC para Polygon PoS {#json-rpc-url-for-polygon-pos}

Neste guia, usaremos https://rpc-mumbai.matic.today, um URL JSON-RPC público fornecido pela Polygon, que pode ter limites de tráfego ou taxa. Este será usado apenas para ligação ao testnet Mumbai da Polygon. Recomendamos que obtenha o seu URL JSON-RPC através de um serviço externo como a Infura, pois a implantação de contratos irá enviar muitas consultas/solicitações para a JSON-RPC.

## Formas de processar a transferência de tokens {#ways-of-processing-the-transfer-of-tokens}
Ao transferir tokens ERC-20 entre chains, eles podem ser processados de dois modos diferentes:

### Modo de bloqueio/desbloqueio {#lock-release-mode}
<b>Chain de origem: </b>os tokens que está a enviar serão bloqueados no Contrato Handler.  <br/>
<b>Chain de destino:</b> a mesma quantidade de tokens que enviou na chain de origem será desbloqueada e transferida do contrato Handler para a conta do destinatário na chain de destino.

### Modo de queima/mineração {#burn-mint-mode}
<b>Chain de origem:</b> os tokens que está a enviar serão queimados.   <br/>
<b>Chain de destino:</b> a mesma quantidade de tokens que enviou e queimou na chain de origem será minerada na chain de destino e enviada para a conta do destinatário.

Pode usar modos diferentes em cada chain. Isto significa que pode bloquear um token na chain principal enquanto minera um token na subchain para transferência. Por exemplo, pode fazer sentido bloquear/desbloquear tokens se a oferta total ou o calendário de mineração forem controlados. Os tokens serão minerados/queimados se o contrato na subchain tiver de seguir a oferta na chain principal.

O modo padrão é o modo de bloqueio/desbloqueio. Se quiser tornar os tokens mineráveis/queimáveis, precisa de chamar o método `adminSetBurnable`. Se pretende minerar tokens aquando da execução, terá de conceder a função de `minter` ao contrato ERC20Handler.


