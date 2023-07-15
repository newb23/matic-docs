---
id: overview
title: Обзор
description: Обзор ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## Что такое ChainBridge? {#what-is-chainbridge}

ChainBridge — это модульный многоцелевой блокчейн-мост с поддержкой EVM и совместимых с Substrate цепочек, созданный ChainSafe. Он позволяет пользователям осуществлять трансфер всех видов активов или сообщений между двумя различными цепочками.

Чтобы узнать больше о ChainBridge, просим вас ознакомиться с [официальной документацией](https://chainbridge.chainsafe.io/), которая предоставлена разработчиками.

Данное руководство должно оказать вам помощь при интеграции Chainbridge в Polygon Edge. В нем рассматривается настройка моста между работающим Polygon PoS (тестовая сеть Mumbai testnet) и локальной сетью Polygon PoS.

## Требования {#requirements}

В этом руководстве вы запустите ноды Polygon Edge, ретранслятор ChainBridge (подробнее об этом [здесь](/docs/edge/additional-features/chainbridge/definitions)) и инструмент cb-sol-cli, который является инструментом CLI для локального развертывания контрактов, регистрации ресурса и изменения настроек для моста (см. [здесь](https://chainbridge.chainsafe.io/cli-options/#cli-options)). Перед началом настройки требуется создать следующие условия:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Кроме того, вам нужно будет клонировать следующие репозитории с версиями для запуска некоторых предложений.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): на ветке `develop`
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [Инструменты развертывания ChainBridge](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093`на `main` ветке


Прежде чем перейти к следующему разделу, необходимо настроить сеть Polygon Edge. Более подробную информацию можно найти в разделах [Локальная настройка](/docs/edge/get-started/set-up-ibft-locally) или [Облачная настройка](/docs/edge/get-started/set-up-ibft-on-the-cloud).