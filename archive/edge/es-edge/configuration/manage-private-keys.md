---
id: manage-private-keys
title: Adminsitración de claves privadas
description: "Cómo administrar las claves privadas y qué tipos de claves existen"
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Descripción general {#overview}

Polygon Edge tiene dos tipos de claves privadas que administra directamente:

* **Claves privada utilizada para el mecanismo de consenso**
* **Clave privada utilizada por libp2p para interconexión**
* **(Opcional) Clave privada BLS utilizada por el mecanismo de consenso para agregar las firmas de los validadores**

Actualmente, Polygon Edge no ofrece soporte para la administración directa de cuentas.

Con base en la estructura del directorio descrita en la [guía de copia de seguridad y restauración](/docs/edge/working-with-node/backup-restore), Polygon Edge almacena esos archivos clave mencionados en dos directorios distintos: **consenso** y **almacén de claves**.

## Formato de la clave {#key-format}

Las claves privadas se guardan en **formato Base64** simple, para que puedan ser legibles por el ser humano y portátiles.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Tipo de claves

Todos los archivos de claves privadas generados y utilizados dentro de Polygon Edge dependen de ECDSA con la curva [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

Como la curva no es estándar, no se puede codificar ni almacenar en ningún formato PEM estandarizado.
No se admite la importación de claves que no se ajusten a este tipo de clave.

:::
## Clave privada de consenso {#consensus-private-key}

El archivo de claves privadas mencionado como *clave privada de consenso*consenso1 también se denomina **clave privada de validador**.
Esta clave privada se utiliza cuando el nodo actúa como validador en la red y debe firmar nuevos datos.

El archivo de clave privada se encuentra en `consensus/validator.key` y se adhiere al [formato de clave](/docs/edge/configuration/manage-private-keys#key-format) mencionado.

:::warning

La clave privada del validador es única para cada nodo validador. La misma clave <b>no</b> debe compartirse entre todos los validadores, ya que eso puede comprometer la seguridad de tu cadena.

:::

## Clave privada de interconexión {#networking-private-key}

El archivo de clave privada que se menciona para interconectarse es utilizado por libp2p para generar la correspondiente ID de par y permitir que el nodo partícipe en la red.

Se encuentra en `keystore/libp2p.key` y se adhiere al [formato de clave](/docs/edge/configuration/manage-private-keys#key-format) mencionado.

## Clave secreta BLS {#bls-secret-key}

El archivo de clave secreta BLS se utiliza para agregar los sellos comprometidos en la capa de consenso. El tamaño de los sellos comprometidos agregados por BLS es menor que las firmas ECDSA comprometidas serializadas.

La característica BLS es opcional y es posible elegir si se utiliza. Consulta [BLS](/docs/edge/consensus/bls) para más detalles.

## Importación y exportación {#import-export}

Como los archivos de claves se almacenan en Base64 simple en el disco, es fácil hacer una copia de seguridad o importarlos.

:::caution Cambio de clave de archivos

Cualquier tipo de cambio realizado en los archivos de claves en una red ya configurada o que esté funcionando puede conducir a una grave interrupción de la red o del consenso,
ya que los mecanismos de consenso y de descubrimiento de pares almacenan los datos derivados de estas claves en el almacenamiento específico del nodo y dependen de ellos para
iniciar las conexiones y ejecutar la lógica del consenso

:::