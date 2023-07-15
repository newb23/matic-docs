---
id: pos-concepts
title: Proof of Stake
description: "Explicação e instruções sobre Proof of Stake."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Visão geral {#overview}

Esta seção visa dar uma melhor visão geral de alguns conceitos atualmente presentes na Proof of Stake (PoS)
implementação do Polygon Edge.

A implementação da Proof of Stake (PoS) do Polygon Edge é uma alternativa para a implementação de IBFT de PoA,
fornecendo aos operadores de nó a capacidade de escolher facilmente entre os dois ao iniciar uma chain.

## Recursos de PoS {#pos-features}

A lógica principal por trás da implementação de Proof of Stake está situada no
o **[Contrato Inteligente de Estágio](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**.

Este contrato é pré-implantado sempre que o Polygon Edge do mecanismo de PoS é inicializado, e está disponível no endereço
`0x0000000000000000000000000000000000001001` do bloco `0`.

### Epochs {#epochs}

Epochs são um conceito introduzido com o acréscimo de PoS ao Polygon Edge.

Os Epochs são considerados um período especial (em blocos) em que um determinado conjunto de validadores pode produzir blocos.
Seus comprimentos são modificáveis, o que significa que os operadores de nós podem configurar o comprimento de uma epoch durante a geração de génese.

No final de cada época, um _bloco_ de época é criado e depois deste evento uma nova época começa. Para saber mais sobre
os blocos da epoch, consulte a seção [Blocos da Epoch](/docs/edge/consensus/pos-concepts#epoch-blocks).

Os conjuntos de validadores são atualizados no final de cada epoch. Os nós consultam o conjunto de validadores do Contrato Inteligente de Staking
durante a criação do bloco de epoch e salvam os dados obtidos para armazenamento local. Este ciclo de consulta e salvamento é
repetido no final de cada epoch.

Essencialmente, isso garante que o Contrato Inteligente de Staking tenha total controle sobre os endereços no conjunto de validadores e
deixe apenas uma responsabilidade para os nós: consultar o contrato uma vez durante cada epoch para buscar informações
do último conjunto de validadores. Isso reduz a responsabilidade que cada nó tem ao cuidar dos conjuntos de validadores.

### Staking {#staking}

Os endereços podem ter fundos de staking no Contrato Inteligente de Staking chamando o método `stake` e especificando um valor para
o valor em staking na transação:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

Com fundos de staking no Contrato Inteligente de Staking, os endereços podem inserir o conjunto de validadores e, portanto, poder participar no
processo de produção de blocos.

:::info Limite para staking
Atualmente, o limite mínimo para inserir o conjunto de validadores é `1 ETH`staking

:::

### Sem staking {#unstaking}

Endereços que tenham fundos de staking podem apenas **cancelar todos os seus fundos de staking de uma só vez**.

O cancelamento do staking pode ser chamado através do método `unstake` no Contrato Inteligente de Staking:

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Depois de cancelar o staking dos seus fundos, os endereços são removidos do conjunto de validadores no Contrato Inteligente de Staking e não são
considerados validadores durante a próxima epoch.

## Blocos de Epoch {#epoch-blocks}

**Os Blocos de Epoch** são um conceito introduzido na implementação de PoS do IBFT no Polygon Edge.

Essencialmente, os blocos de epoch são blocos especiais que **não contêm transações** e ocorrem apenas no **final de uma epoch**.
Por exemplo, se o **tamanho da época** estiver definido como `50`blocos, os blocos da época seriam considerados como blocos `50`, `100``150`e assim por diante.

Eles são usados para executar lógica adicional que não deve ocorrer durante a produção regular de blocos.

Mais importante, eles são uma indicação para o nó de que **ele precisa para buscar as informações mais recentes do conjunto de validadores**
a partir do Contrato Inteligente de Staking.

Depois de atualizar o conjunto de validadores no bloco de epoch, o conjunto de validadores (alterado ou inalterado)
é usado para os blocos `epochSize - 1` subsequentes, até que ele seja atualizado novamente obtendo as informações mais recentes do
Contrato Inteligente de Staking.

Os comprimentos de epoch (em blocos) são modificáveis ao gerar o ficheiro de génese, usando um sinalizador especial `--epoch-size`:

```bash
polygon-edge genesis --epoch-size 50 ...
```

O tamanho padrão de uma epoch é blocos `100000` no Polygon Edge.

## Pré-implantação de contrato {#contract-pre-deployment}

O _Polygon Edge_ pré-implementa
o [Contrato Inteligente de Staking.](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)
durante a **geração de génese** para o endereço `0x0000000000000000000000000000000000001001`.

Ele faz isso sem um EVM em execução, modificando o estado do blockchain do Contrato Inteligente, usando os valores
de configuração transmitidos para o comando de génese.
