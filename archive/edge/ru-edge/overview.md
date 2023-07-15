---
id: overview
title: Polygon Edge
sidebar_label: What is Edge
description: "Введение в Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - network
  - modular

---

Polygon Edge — это модульная расширяемая основа для построения совместимых с Ethereum сетей блокчейн, сайдчейнов и решений общего масштабирования.

Основное назначение Polygon Edge — создание новой сети блокчейн при полной совместимости со смарт-контрактами и транзакциями Ethereum. Эта основа использует механизм консенсуса IBFT (Стамбульская византийская отказоустойчивость), поддерживаемый в двух вариантах: [PoA (доказательство полномочий)](/docs/edge/consensus/poa) и [PoS (доказательство доли владения](/docs/edge/consensus/pos-stake-unstake)).

Polygon Edge также поддерживает связь с множественными сетями блокчейн и позволяет передавать как токены [ERC-20](https://ethereum.org/en/developers/docs/standards/tokens/erc-20), так и [ERC-721](https://ethereum.org/en/developers/docs/standards/tokens/erc-721), используя [централизованное решение моста](/docs/edge/additional-features/chainbridge/overview).

Кошельки промышленного стандарта могут использоваться для взаимодействия с Polygon Edge через конечные точки [JSON-RPC](/docs/edge/working-with-node/query-json-rpc), а операторы нод могут выполнять различные действия на нодах через протокол [gRPC](/docs/edge/working-with-node/query-operator-info).

Чтобы получить более детальную информацию про Polygon, вы можете посетить [официальный сайт](https://polygon.technology).

**[Репозиторий GitHub](https://github.com/0xPolygon/polygon-edge)**

:::caution

Это незавершенная работа, поэтому в будущем возможны архитектурные изменения. Код еще не прошел проверку, поэтому просим вас связаться с командой Polygon, если вы хотите использовать его в производстве.

:::



Для начала работы с `polygon-edge`сетью локально, просим вас ознакомиться с разделами [Установка](/docs/edge/get-started/installation) и [Локальная настройка](/docs/edge/get-started/set-up-ibft-locally).
