---
id: overview
title: Descripción general
description: Descripción de ChainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---

## ¿Qué es ChainBridge? {#what-is-chainbridge}

ChainBridge es un puente modular de la cadena de bloques multidireccional que admite cadenas compatibles con EVM y Substrate, construido por ChainSafe. Permite a los usuarios transferir todo tipo de activos o mensajes entre dos cadenas diferentes.

Para obtener más información sobre ChainBridge, consulta primero la [documentación oficial](https://chainbridge.chainsafe.io/) proporcionada por sus desarrolladores.

Esta guía ayuda a integrar Chainbridge en Polygon Edge. Explica la configuración a través de un puente entre un PoS de Polygon en funcionamiento (red de pruebas Mumbai) y una red local de Polygon Edge.

## Requisitos {#requirements}

En esta guía, ejecutarás los nodos Polygon Edge, un repetidor ChainBridge (más información sobre este [aquí](/docs/edge/additional-features/chainbridge/definitions)), y la herramienta cb-sol-cli, que es una herramienta CLI para desplegar contratos localmente, registrar recursos, y cambiar la configuración del puente (puedes comprobarla [aquí](https://chainbridge.chainsafe.io/cli-options/#cli-options)). Los siguientes entornos son necesarios antes de iniciar la configuración:

* Go: >= 1.17
* Node.js >= 16.13.0
* Git


Además, tendrás que clonar los siguientes repositorios con las versiones para ejecutar algunas aplicaciones.

* [Polygon Edge](https://github.com/0xPolygon/polygon-edge): en la ramificación `develop`
* [ChainBridge](https://github.com/ChainSafe/ChainBridge): v1.1.5
* [ChainBridge Deploy Tools](https://github.com/ChainSafe/chainbridge-deploy): `f2aa093`en la ramificación `main`


Tienes que configurar una red de Polygon Edge antes de pasar a la siguiente sección. Si necesitas más información, por favor, comprueba la [configuración local](/docs/edge/get-started/set-up-ibft-locally) o [ la configuración de la nube](/docs/edge/get-started/set-up-ibft-on-the-cloud).