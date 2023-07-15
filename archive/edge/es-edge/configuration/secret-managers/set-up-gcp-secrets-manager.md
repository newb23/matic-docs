---
id: set-up-gcp-secrets-manager
title: Configura el Administrador de secretos en la plataforma de Google Cloud (GCP)
description: "Configura el Administrador de secretos de GCP para Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - gcp
  - secrets
  - manager
---

## Descripción general {#overview}

En la actualidad, Polygon Edge se encarga de mantener 2 importantes secretos de ejecución:
* La **clave privada del validador** utilizada por el nodo, si el nodo es un validador
* La **clave privada de interconexión** utilizada por libp2p para participar en subastas y comunicarse con otros pares

Para obtener información adicional, lee la [guía de gestión de claves privadas](/docs/edge/configuration/manage-private-keys).

Los módulos de Polygon Edge **no deberían tener que saber cómo guardar secretos**. Finalmente, a un módulo no debería importarle si
un secreto se almacena en un servidor lejano o localmente, en el disco del nodo.

Todo lo que un módulo necesita saber sobre guardar secretos es **saber utilizar el secreto** y** saber qué secretos obtener
o guardar**. Los detalles de implementación más precisos de estas operaciones se le delegan a `SecretsManager`, que es, lógicamente, una abstracción.

El operador de nodos que está iniciando Polygon Edge ya puede especificar qué administrador de secretos quiere utilizar, y tan pronto
el administrador de secretos correcto es instanciado, los módulos se ocupan de los secretos por medio de la interfaz mencionada
independientemente de si los secretos se almacenan en un disco o en un servidor.

Este artículo explica los pasos necesarios para iniciar Polygon Edge con el [Administrador de secretos de GCP](https://cloud.google.com/secret-manager).

:::info Guías anteriores

Se **recomienda enfáticamente** que, antes de leer este artículo, leas los artículos acerca de la [**configuración local**](/docs/edge/get-started/set-up-ibft-locally)
y la [**configuración de la nube**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Prerrequisitos {#prerequisites}
### Cuenta de facturación de GCP {#gcp-billing-account}
Para poder utilizar el Adminsitrador de secretos de GCP, el usuario debe tener la [Cuenta de facturación](https://console.cloud.google.com/) habilitada en el portal de GCP.
Las nuevas cuentas de Google en la plataforma de GCP tienen algunos fondos para empezar, como parte de la prueba gratuita.
Información más detallada [sobre los documentos de GCP](https://cloud.google.com/free)

### API del Adminsitrador de secretos {#secrets-manager-api}
El usuario deberá habilitar la API del Adminsitrador de secretos de GCP antes de poder utilizarla.
Eso se puede hacer mediante el [portal de la API del Administrador de secretos](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com).
Información más detallada: [Configuración de Administrador de secretos](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### Credenciales de GCP {#gcp-credentials}
Por último, el usuario debe generar nuevas credenciales que se utilizarán para la autenticación.
Eso se puede hacer siguiendo las instrucciones publicadas [aquí](https://cloud.google.com/secret-manager/docs/reference/libraries)    
El archivo json generado que contiene credenciales debe transferirse a cada uno de los nodos que necesita utilizar el administrador de secretos de GCP.

Información necesaria antes de continuar:
* **ID del proyecto** (la ID del proyecto definido en la plataforma GCP)
* **Ubicación del archivo de credenciales** (la ruta del archivo json que contiene las credenciales)

## Paso 1: Genera la configuración del administrador de secretos {#step-1-generate-the-secrets-manager-configuration}

Para que el Polygon Edge pueda comunicarse sin problemas con el administrador de secretos de GCP, debe analizar un archivo de configuración
ya generado, que contiene toda la información necesaria para el almacenamiento de secretos en el administrador de secretos de GCP.

Para generar la configuración, ejecuta el siguiente comando:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Parámetros presentes:
* `PATH` es la ruta a la que se debe exportar el archivo de configuración. `./secretsManagerConfig.json` por defecto
* `NODE_NAME`es el nombre del nodo actual para el cual se está estableciendo la configuración del administrador de secretos de GCP. Puede ser un valor arbitrario. `polygon-edge-node` por defecto
* `PROJECT_ID`es la ID del proyecto que es definida por el usuario en la consola de GCP durante la configuración de la cuenta y la activación de la API del Administrador de secretos.
* `GCP_CREDS_FILE` es la ruta del archivo json que contiene las credenciales que permitirán el acceso de lectura o escritura al administrador de secretos.

:::caution Nombres de los nodos

Ten cuidado al especificar los nombres de los nodos.

Polygon Edge utiliza el nombre del nodo especificado para hacerle seguimiento a los secretos que genera y utiliza en el administrador de secretos de GCP.
Especificar un nombre de nodo existente puede provocar que no se escriba el secreto en el administrador de secretos de GCP.

Los secretos se guardan en la siguiente ruta base: `projects/PROJECT_ID/NODE_NAME`

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

Dado que el administrador de secretos de GCP se está utilizando en lugar del sistema de archivos local, se deben agregar las direcciones de los validadores mediante la indicación`--ibft-validator`.
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Paso 4: inicia el cliente de Polygon Edge {#step-4-start-the-polygon-edge-client}

Ahora que las claves están configuradas y el archivo génesis ha sido generado, el paso final de este proceso será iniciar
Polygon Edge con el comando `server`.

El comando `server` se utiliza de la misma manera que en las guías ya mencionadas, con una pequeña adición, el indicador `--secrets-config`:
```bash
polygon-edge server --secrets-config <PATH> ...
```

El parámetro `PATH` es la ubicación del parámetro del administrador de secretos previamente generado en el paso 1.