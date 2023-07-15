---
id: set-up-hashicorp-vault
title: Configuración de Vault de Hashicorp
description: "Configurar Vault de Hashicorp para Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Descripción general {#overview}

En la actualidad, Polygon Edge se encarga de mantener 2 importantes secretos de ejecución:
* La **clave privada del validador** utilizada por el nodo, si el nodo es un validador
* La **clave privada de interconexión** utilizada por libp2p para participar y comunicarse con otros pares

:::warning

La clave privada del validador es única para cada nodo validador. La misma clave <b>no</b> debe compartirse entre todos los validadores, ya que eso puede comprometer la seguridad de tu cadena.

:::

Para obtener información adicional, lee la [guía de administración de claves privadas](/docs/edge/configuration/manage-private-keys).

Los módulos de Polygon Edge **no deberían tener que saber cómo guardar secretos**. Finalmente, a un módulo no debería importarle si
un secreto se almacena en un servidor lejano o localmente, en el disco del nodo.

Todo lo que un módulo necesita saber sobre guardar secretos es **saber utilizar el secreto** y** saber qué secretos obtener
o guardar**. Los detalles de implementación más precisos de estas operaciones se le delegan a `SecretsManager`, que es, lógicamente, una abstracción.

El operador de nodos que está iniciando Polygon Edge ya puede especificar qué administrador de secretos quiere utilizar, y tan pronto
el administrador de secretos correcto es instanciado, los módulos se ocupan de los secretos por medio de la interfaz mencionada
independientemente de si los secretos se almacenan en un disco o en un servidor.

Este artículo detalla los pasos necesarios para iniciar Polygon Edge con un servidor de [Vault de Hashicorp](https://www.vaultproject.io/).

:::info Guías anteriores

Se **recomienda enfáticamente** que, antes de leer este artículo, leas los artículos acerca de la [**configuración local**](/docs/edge/get-started/set-up-ibft-locally)
y la [**configuración de la nube**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Prerrequisitos {#prerequisites}

Este artículo asume que una instancia en funcionamiento del servidor Vault de Hashicorp **ya está configurada**.

Además, es necesario que el servidor de Vault de Hashicorp que se utilice para Polygon Edge tenga **habilitado el almacenamiento clave-valor (KV)**.

Información necesaria antes de continuar:
* **El URL** del servidor (el URL de la API del servidor de Vault de Hashicorp)
* **Token** (token de acceso utilizado para acceder al motor de almacenamiento de KV)

## Paso 1: Genera la configuración del administrador de secretos {#step-1-generate-the-secrets-manager-configuration}

Para que Polygon Edge pueda comunicarse sin problemas con el servidor de Vault, debe analizar un archivo de configuración
ya generado, que contenga toda la información necesaria para el almacenamiento de secretos en Vault.

Para generar la configuración, ejecuta el siguiente comando:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Parámetros presentes:
* `PATH` es la ruta a la que se debe exportar el archivo de configuración. `./secretsManagerConfig.json` por defecto
* `TOKEN` es el token de acceso ya mencionado en la [sección de prerrequisitos](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `SERVER_URL`es el URL de la API para el servidor de Vault, también mencionada en la [sección de prerrequisitos](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `NODE_NAME`es el nombre del nodo actual para el que la configuración de Vault se está configurando. Puede ser un valor arbitrario. `polygon-edge-node` por defecto

:::caution Nombres de los nodos

Ten cuidado al especificar los nombres de los nodos.

Polygon Edge utiliza el nombre del nodo especificado para hacerle seguimiento a los secretos que genera y utiliza en la instancia de Vault.
La especificación del nombre de un nodo existente podría tener como consecuencia la sobrescritura de los datos en el servidor de Vault.

Los secretos se guardan en la siguiente ruta base: `secrets/node_name`

:::

## Paso 2: inicializa las claves secretas con la configuración {#step-2-initialize-secret-keys-using-the-configuration}

Ahora que el archivo de configuración está presente, podemos inicializar las claves secretas necesarias con el archivo
de configuración, establecido en el paso 1, con: `--config`

```bash
polygon-edge secrets init --config <PATH>
```

El parámetro `PATH` es la ubicación del parámetro del administrador de secretos previamente generado en el paso 1.

## Paso 3: genera el archivo génesis {#step-3-generate-the-genesis-file}

El archivo génesis debe generarse de manera similar a como lo indican las guías de la [**configuración local**](/docs/edge/get-started/set-up-ibft-locally)
y de la [**configuración de la nube**](/docs/edge/get-started/set-up-ibft-on-the-cloud), con pocos cambios.

Dado que Vault de Hashicorp se está utilizando en lugar del sistema de archivos local, se deben agregar las direcciones de los validadores por medio del indicador `--ibft-validator`:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Paso 4: Inicia el cliente de Polygon Edge {#step-4-start-the-polygon-edge-client}

Ahora que las claves están configuradas y el archivo génesis ha sido generado, el paso final de este proceso será iniciar
Polygon Edge con el comando `server`.

El comando `server` se utiliza de la misma manera que en las guías ya mencionadas, con una pequeña adición, el indicador `--secrets-config`:
```bash
polygon-edge server --secrets-config <PATH> ...
```

El parámetro `PATH` es la ubicación del parámetro del administrador de secretos previamente generado en el paso 1.