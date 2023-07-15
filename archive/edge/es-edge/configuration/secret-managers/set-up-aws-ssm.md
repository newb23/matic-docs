---
id: set-up-aws-ssm
title: Configurar el Agente de administración de sistemas (SSM) de AWS
description: "Configura el SSM (Agente de administración de sistemas) de AWS para Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
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

Este artículo detalla los pasos necesarios para que Polygon Edge inicie y se ejecute con
la [tienda de parámetros del administrador de sistemas de AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

:::info Guías anteriores

Se **recomienda enfáticamente** que, antes de leer este artículo, leas los artículos acerca de la [**configuración local**](/docs/edge/get-started/set-up-ibft-locally)
y la [**configuración de la nube**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Prerrequisitos {#prerequisites}
### Política de Administración de identidad y acceso (IAM) {#iam-policy}
El usuario debe crear una política de IAM que permita leer y escribir operaciones para la tienda de parámetros del administrador de sistemas de AWS. Después de crear la política de IAM con éxito, el usuario debe conectarla con la instancia de EC2 que está ejecutando el servidor de Polygon Edge.
La política de IAM debería verse así:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Obten más información sobre los roles de IAM del administrador de sistemas de AWS que puedes encontrar en la [documentación de AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Información necesaria antes de continuar:
* **Región**: la región en la que están ubicados el administrador de sistemas y los nodos
* **Ruta de los parámetros**: ruta arbitraria en la que se ubicará el secreto, por ejemplo, `/polygon-edge/nodes`)

## Paso 1: genera la configuración del administrador de secretos {#step-1-generate-the-secrets-manager-configuration}

Para que Polygon Edge pueda comunicarse sin problemas con el administrador de sistemas de AWS, debe analizar un
archivo de configuración ya generado, el cual contiene toda la información necesaria para almacenar secretos en el SSM de AWS.

Para generar la configuración, ejecuta el siguiente comando:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Parámetros presentes:
* `PATH` es la ruta a la que se debe exportar el archivo de configuración. `./secretsManagerConfig.json` por defecto
* `NODE_NAME` es el nombre del nodo actual para el que se está configurando la el SSM de AWS. Puede ser un valor arbitrario. `polygon-edge-node` por defecto
* `REGION` es la región en la que está ubicado el SSM de AWS. Debe ser la misma región que la del nodo que utiliza el SSM de AWS.
* `SSM_PARAM_PATH` es el nombre de la ruta en la que se almacenará el secreto. Por ejemplo, si se especifican `--name node1` y `ssm-parameter-path=/polygon-edge/nodes`,
el secreto se guardará como `/polygon-edge/nodes/node1/<secret_name>`.

:::caution Nombres de los nodos

Ten cuidado al especificar los nombres de los nodos.

Polygon Edge utiliza el nombre del nodo especificado para hacerle seguimiento a los secretos que genera y utiliza en el SSM de AWS. Especificar un nombre de nodo existente puede causar la imposibilidad de escribir el secreto en el SSM de AWS.

Los secretos se guardan en la siguiente ruta base: `SSM_PARAM_PATH/NODE_NAME`

:::

## Paso 2: inicializa las claves secretas con la configuración {#step-2-initialize-secret-keys-using-the-configuration}

Ahora que el archivo de configuración está presente, podemos inicializar las claves secretas necesarias con el archivo
de configuración, establecido en el paso 1, con: `--config`

```bash
polygon-edge secrets init --config <PATH>
```

El  parámetro `PATH` es la ubicación del parámetro del administrador de secretos previamente generado en el paso 1.

:::info Política de Administración de identidad y acceso (IAM)

Ese paso fallará si la política de IAM que permite las operaciones de lectura y escritura no está configurada correctamente o no está vinculada con la instancia de EC2 que ejecuta ese comando.

:::

## Paso 3: genera el archivo génesis {#step-3-generate-the-genesis-file}

El archivo génesis debe generarse de manera similar a como lo indican las guías de la [**configuración local**](/docs/edge/get-started/set-up-ibft-locally)
y de la [**configuración de la nube**](/docs/edge/get-started/set-up-ibft-on-the-cloud), con pocos cambios.

Dado que el SSM de AWS se está utilizando en lugar del sistema de archivos local, se deben agregar las direcciones de los validadores a través de la indicación `--ibft-validator`:
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