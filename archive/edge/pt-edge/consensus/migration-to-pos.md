---
id: migration-to-pos
title: Migração de PoA para PoS
description: "Como migrar o modo IBFT de PoA para PoS e vice-versa."
keywords:
  - docs
  - polygon
  - edge
  - migrate
  - PoA
  - PoS
---

## Visão geral {#overview}

Esta secção orienta através da migração de modos de IBFT de PoA a PoS e vice-versa, para um cluster em execução, sem a necessidade de redefinir a blockchain.

## Como migrar para PoS {#how-to-migrate-to-pos}

Precisará parar todos os nós, adicionar a configuração de fork no genesis.json pelo comando `ibft switch` e reiniciar os nós.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --deployment 100 --from 200
````
:::caution Mudar enquanto estiver a usar o ECDSA
Ao usar o ECDSA, o `--ibft-validator-type`sinalizador deve ser adicionado ao interruptor, mencionando que o ECDSA é usado. Se não for incluída, o Edge irá mudar automaticamente para BLS.

````bash
polygon-edge ibft switch --chain ./genesis.json --type PoS --ibft-validator-type ecdsa --deployment 100 --from 200
````
:::Para mudar para PoS, terá de especificar 2 alturas de blocos: `deployment`e . `from`é `deployment`a altura para implantar o contrato de staking e é `from`a altura do início do PoS. O contrato de staking será implantado no endereço `0x0000000000000000000000000000000000001001` e `deployment`, como no caso de contrato pré-implantado.

Verifique o [Proof of Stake](/docs/edge/consensus/pos-concepts) para mais detalhes sobre o contrato de staking.

:::warning Os validadores precisam fazer staking manualmente
Cada validador precisa fazer staking após o contrato ser implantado em `deployment` e antes de `from`, para ser um validador no início do PoS. Cada validador atualizará o conjunto de validadores pelo conjunto no contrato de staking no início do PoS.

Para saber mais sobre a classificação, visite a **[Configuração e uso da Proof of Stake](/docs/edge/consensus/pos-stake-unstake)**.
:::
