---
id: overview
title: Visão geral
description: Visão geral da ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## O que é a ChainBridge? {#what-is-chainbridge}

A ChainBridge é uma bridge de blockchain modular, multidirecional que suporta chains compatíveis com EVM e Substrate, criada pela ChainSafe. Permite que os utilizadores transfiram todo o tipo de ativos ou mensagens entre duas chains diferentes.

Para saber mais sobre a ChainBridge, visite primeiro os [documentos oficiais](https://chainbridge.chainsafe.io/) fornecidos pelos respetivos programadores.

Este guia foi criado para o ajudar a integrar a Chainbridge no Polygon Edge. Ele segue a configuração de uma bridge entre um Polygon PoS (testnet Mumbai) em execução e uma rede Polygon Edge local.

## Requisitos {#requirements}

Neste guia, irá executar nós do Polygon Edge, um relayer ChainBridge (mais sobre este assunto [aqui](/docs/edge/additional-features/chainbridge/definitions)) e a ferramenta cb-sol-cli, que é uma ferramenta CLI para implantar contratos localmente, registando o recurso e alterando as configurações da bridge (veja também [aqui](https://chainbridge.chainsafe.io/cli-options/#cli-options)). Antes de iniciar a configuração, são necessários os seguintes ambientes:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Além disso, terá de clonar os seguintes repositórios com as versões para executar algumas aplicações.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): no ramo `develop`
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [Ferramentas de Implantação ChainBridge](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093` no ramo `main`


É necessário configurar uma rede Polygon Edge antes de continuar para a seção seguinte. Visite a página [Configuração Local](/docs/edge/get-started/set-up-ibft-locally) ou [Configuração na Nuvem](/docs/edge/get-started/set-up-ibft-on-the-cloud) para mais detalhes.