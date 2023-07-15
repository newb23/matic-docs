---
id: backup-restore
title: Copia de seguridad o restauración de la instancia de nodo
description: "Cómo hacer una copia de seguridad y restaurar una instancia de nodo de Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Descripción general {#overview}

La presente guía explica cómo hacer una copia de seguridad y restaurar una instancia de nodo de Polygon Edge.
Abarca las carpetas básicas, lo que contienen y qué archivos son críticos para hacer una copia de seguridad y restauración correctamente.

## Carpetas básicas {#base-folders}

Polygon Edge utiliza LevelDB como motor de almacenamiento.
Al iniciar un nodo de Polygon Edge, se crean las siguientes subcarpetas en el directorio de trabajo especificado:
* **blockchain** (cadena de bloques): almacena los datos de la cadena de bloques
* **tree** (árbol): almacena los árboles de Merkle (datos del estado mundial)
* **keystore** (almacén de claves): guarda las claves privadas para el cliente Eso incluye la clave privada de libp2p y la clave privada de sellado y validación.
* **consensus** (consenso): almacena cualquier información de consenso que el cliente pueda necesitar mientras trabaja. Por ahora, almacena la *clave de validación privada* del nodo

Es esencial conservar esas carpetas para que la instancia de Polygon Edge se ejecute sin problemas.

## Creación de una copia de seguridad de un nodo en ejecución y restauración para un nuevo nodo {#create-backup-from-a-running-node-and-restore-for-new-node}

Esta sección te guía en la creación de datos de archivo de la cadena de bloques en un nodo en ejecución y su restauración en otra instancia.

### Copia de seguridad {#backup}

El comando `backup` trae los bloques de un nodo en ejecución mediante gRPC y genera una carpeta de archivo. Si `--from` y `--to` no se dan en el comando, este comando traerá los bloques desde el de génesis hasta el más reciente.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Restauración {#restore}

Un servidor importa los bloques de un archivo al principio cuando se inicia con la indicación `--restore`. Cerciórate de que el nuevo nodo tenga clave. Para obtener más información sobre la importación o la generación de claves, visita la seción [Administradores de secretos](/docs/edge/configuration/secret-managers/set-up-aws-ssm)

```bash
$ polygon-edge server --restore archive.dat
```

## Copia de seguridad o restauración de datos completos {#back-up-restore-whole-data}

Esta sección te guía para hacer una copia de seguridad de los datos, incluyendo los datos de estado y la clave y hacer la restauración en la nueva instancia.

### Paso 1: detén el cliente en ejecución {#step-1-stop-the-running-client}

Dado que Polygon Edge utiliza **LevelDB** para el almacenamiento de datos, el nodo debe detenerse durante la ejecución de la copia de seguridad,
ya que **LevelDB** no permite el acceso simultáneo a sus archivos de base de datos.

Por otro lado, Polygon Edge también hace descarga de datos al cerrarse.

El primer paso consiste en detener el cliente en ejecución (mediante un administrador de servicios o algún otro mecanismo que le envíe una señal SIGINT al proceso),
para que pueda desencadenar 2 eventos al mismo tiempo que se desconecta gradualmente:
* Ejecución de la descarga de datos en el disco
* Liberación de los archivos de la base de datos bloqueados por LevelDB

### Paso 2: haz una copia de seguridad del directorio {#step-2-backup-the-directory}

Ahora que el cliente no se está ejecutando, se puede hacer una copia de seguridad del directorio de datos en otro medio.
Hay que recordar que los archivos con extensión `.key` contienen los datos de la clave privada que se pueden utilizar para suplantar al nodo actual
y, por lo tanto, nunca deben compartirse con un tercero o desconocido.

:::info

Haz una copia de seguridad y restaura el archivo `genesis` generado manualmente, para que el nodo restaurado funcione plenamente.

:::

## Restauración {#restore-1}

### Paso 1: detén el cliente en ejecución {#step-1-stop-the-running-client-1}

Si se está ejecutando alguna instancia de Polygon Edge, hay que detenerla para que el paso 2 pueda cumplirse.

### Paso 2: copia el directorio de datos de la copia de seguridad en la carpeta deseada {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

Cuando el cliente no esté en ejecución, el directorio de datos del que se ha hecho copia de seguridad puede copiarse en la carpeta deseada.
Además, restaura el archivo `genesis` previamente copiado.

### Paso 3: ejecuta el cliente de Polygon Edge especificando el directorio de datos correcto {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Para que Polygon Edge utilice el directorio de datos restaurado, en el momento del inicio, el usuario debe especificar la ruta del
directorio de datos. Consulta la sección de [Comandos CLI](/docs/edge/get-started/cli-commands) para obtener información sobre la indicación `data-dir`
