---
id: permission-contract-deployment
title: Разрешение на развертывание смарт-контрактов
description: Как добавить разрешение на развертывание смарт-контрактов.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Обзор {#overview}

Руководство подробно описывает, как составить белый список адресов, на которых можно развернуть смарт-контракты. Операторы сети иногда хотят предотвратить развертывание пользователями смарт-контрактов, не имеющих отношения к целям сети. Операторы сети могут сделать следующее:

1. Составить белый список адресов для развертывания смарт-контрактов
2. Удалить адреса из белого списка для развертывания смарт-контрактов

## Видеопрезентация {#video-presentation}

[![Развертывание контракта с разрешением - видео](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Как это использовать? {#how-to-use-it}


Вы можете найти все команды cli, связанные с белым списком для развертывания на странице [Команды CLI](/docs/edge/get-started/cli-commands#whitelist-commands).

* `whitelist show`: отображает информацию о белом списке
* `whitelist deployment --add`: добавляет новый адрес к белому списку для развертывания контрактов
* `whitelist deployment --remove`: удаляет новый адрес из белого списка для развертывания контрактов

#### Отобразить все адреса из белого списка для развертывания {#show-all-addresses-in-the-deployment-whitelist}

Существует 2 способа найти адреса из белого списка для развертывания.
1. Посмотреть `genesis.json`, где сохраняются белые списки
2. Выполнить `whitelist show`, что распечатывает информацию для всех белых списков, которые поддерживаются Polygon Edge

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Добавить адрес в белый список для развертывания {#add-an-address-to-the-deployment-whitelist}

Чтобы добавить новый адрес в белый список для развертывания, необходимо выполнить `whitelist deployment --add [ADDRESS]`команду  CLI. Количество адресов, которые присутствуют в белом списке, не ограничено. Только те адреса, которые присутствуют в белом списке для развертывания, могут развертывать контракты. Если белый список пуст, то любой адрес может выполнять развертывание.

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Удалить адрес из белого списка для развертывания. {#remove-an-address-from-the-deployment-whitelist}

Чтобы удалить адрес из белого списка для развертывания, выполните `whitelist deployment --remove [ADDRESS]` команду CLI. Только те адреса, которые присутствуют в белом списке для развертывания, могут развертывать контракты. Если белый список пуст, то любой адрес может выполнять развертывание.

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```
