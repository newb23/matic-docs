---
id: permission-contract-deployment
title: Berechtigung zur Bereitstellung von Smart-Contract
description: So fügen Sie die Berechtigung zur Bereitstellung von Smart-Contracts hinzu.
keywords:
  - docs
  - polygon
  - edge
  - smart contract
  - permission
  - deployment
---

## Übersicht {#overview}

In diesem Leitfaden wird detailliert beschrieben, wie Sie Adressen, die Smart-Contracts einsetzen können, auf die Whitelist setzt.
Manchmal möchten die Betreiber eines Netzwerks verhindern, dass Benutzer Smart-Contracts einsetzen, die nichts mit dem Zweck des Netzwerks zu tun haben. Netzwerkbetreiber können:

1. Adressen zur Whitelist für die Bereitstellung von Smart-Contract hinzufügen
2. Adressen von der Whitelist für die Bereitstellung von Smart-Contract entfernen

## Video-Präsentation {#video-presentation}

[![permission Contract-Bereitstellung - Video](https://img.youtube.com/vi/yPOkINpf7hg/0.jpg)](https://www.youtube.com/watch?v=yPOkINpf7hg)

## Wie verwendet man sie? {#how-to-use-it}


Alle CLI-Befehle, die mit der Bereitstellung der Whitelist zusammenhängen, finden Sie auf der Seite [CLI-Befehle](/docs/edge/get-started/cli-commands#whitelist-commands).

* `whitelist show`: Zeigt Informationen zur Whitelist
* `whitelist deployment --add`: Fügt eine neue Adresse zur Whitelist für die Bereitstellung von Contracts hinzu
* `whitelist deployment --remove`: Entfernt eine neue Adresse von der Whitelist für die Bereitstellung von Contracts

#### Alle Adressen in der Bereitstellungs-Whitelist anzeigen {#show-all-addresses-in-the-deployment-whitelist}

Es gibt 2 Möglichkeiten, Adressen von der Whitelist für die Bereitstellung zu finden.
1. Sehen Sie sich `genesis.json`an, wo Whitelists gespeichert werden
2. Ausführen von,`whitelist show` das Informationen für alle von Polygon Edge unterstützten Whitelists druckt

```bash

./polygon-edge whitelist show

[WHITELISTS]

Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d],


```

#### Hinzufügen einer neuen Adresse zur Whitelist {#add-an-address-to-the-deployment-whitelist}

Um eine neue Adresse zur Bereitstellungs-Whitelist hinzuzufügen, den CLI-Befehl `whitelist deployment --add [ADDRESS]`ausführen. Es gibt kein Limit für die Anzahl der Adressen in der Whitelist. Nur Adressen, die auf der Whitelist für die Bereitstellung von Contracts stehen, können diese bereitstellen. Wenn die Whitelist leer ist, kann jede Adresse die Bereitstellung durchführen

```bash

./polygon-edge whitelist deployment --add 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --add 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Added addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],



```

#### Entfernen einer Adresse von der Whitelist {#remove-an-address-from-the-deployment-whitelist}

Um eine Adresse aus der Bereitstellungs-Whitelist zu entfernen, führe den CLI-Befehl `whitelist deployment --remove [ADDRESS]`aus. Nur Adressen, die auf der Whitelist für die Bereitstellung von Contracts stehen, können diese bereitstellen. Wenn die Whitelist leer ist, kann jede Adresse die Bereitstellung durchführen

```bash

./polygon-edge whitelist deployment --remove 0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d --remove 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF


[CONTRACT DEPLOYMENT WHITELIST]

Removed addresses: [0x5383Cb489FaCa92365Bb6f9f1FB40bD032E6365d 0x30ea4435167Ee91f9f874b5a894F3282A956C3FF],
Contract deployment whitelist : [],



```
