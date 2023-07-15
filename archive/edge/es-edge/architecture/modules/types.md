---
id: types
title: Tipos
description: Explicación del módulo Types (Tipos) de Polygon Edge
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Descripción general {#overview}

El módulo **Types** implementa tipos principales de objetos, por ejemplo:

* **Dirección**
* **Hash**
* **Encabezado**
* Muchas funciones de ayuda

## Codificación y decodificación con RLP {#rlp-encoding-decoding}

A diferencia de clientes como GETH, Polygon Edge no utiliza la reflexión para la codificación.<br />
Se prefirió no utilizar la reflexión porque introduce nuevos problemas, como de rendimiento, degradación y dificultad de escalabilidad.

El módulo **Types** ofrece una interfaz fácil de usar para marshalling (presentar) y unmarshalling (reconstruir) el RLP mediante el uso del paquete FastRLP.

Marshaling se realiza a través de los métodos *MarshalRLPWith* y *MarshalRLPTO*. Existen métodos análogos para
unmarshalling.

Al definir estos métodos manualmente, Polygon Edge no necesita utilizar la reflexión. En *rlp_marshal.go*, puedes encontrar
métodos para marshalling:

* **Cuerpos**
* **Bloques**
* **Encabezados**
* **Recibos**
* **Registros**
* **Transacciones**