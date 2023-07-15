---
id: validator-hosting
title: Alojamiento del validador
description: "Requisitos de alojamiento para Polygon Edge"
keywords:
- docs
- polygon
- edge
- hosting
- cloud
- setup
- validator
---

A continuación se presentan las sugerencias para alojar correctamente un nodo validador en una red de Polygon Edge. Préstale mucha atención a todos los elementos que se enumeran a continuación y asegúrate
de que la configuración de tu validador está configurada correctamente para que sea segura, estable y eficaz.

## Base de conocimiento {#knowledge-base}

Antes de intentar ejecutar el nodo validador, lee detenidamente este documento.   
Otros documentos que pueden ser útiles son:

- [Instalación](get-started/installation)
- [Configuración de la nube](get-started/set-up-ibft-on-the-cloud)
- [Comandos de CLI](get-started/cli-commands)
- [Archivo de configuración del servidor](configuration/sample-config)
- [Claves privadas](configuration/manage-private-keys)
- [Métricas de Prometheus](configuration/prometheus-metrics)
- [Administradores secretos](/docs/category/secret-managers)
- [Copia de seguridad o restauración](working-with-node/backup-restore)

## Requisitos mínimos del sistema {#minimum-system-requirements}

| Tipo | Valor | Influenciado por |
|------|------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| CPU | 2 núcleos | <ul><li>Número de consultas JSON RPC</li><li>Tamaño del estado de la cadena de bloques</li><li>Límite de gas de los bloques</li><li>Tiempo del bloque</li></ul> |
| RAM | 2 GB | <ul><li>Número de consultas JSON RPC</li><li>Tamaño del estado de la cadena de bloques</li><li>Límite de gas de los bloques</li></ul> |
| Disco | <ul><li>10 GB de partición de la raíz</li><li>Partición de la raíz de 30 GB con administración del volumen lógico (LVM) para la extensión del disco</li></ul> | <ul><li>Tamaño del estado de la cadena de bloques</li></ul> |


## Configuración de servicio {#service-configuration}

El binario `polygon-edge` debe ejecutarse como un servicio del sistema automáticamente al establecerse la conectividad de la red y tener las funcionalidades inicio, parada y reinicio.
funcionalidades. Recomendamos utilizar un administrador de servicios como `systemd.`

Ejemplo de archivo de configuración del sistema `systemd`:
```
[Unit]
Description=Polygon Edge Server
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=10
User=ubuntu
ExecStart=/usr/local/bin/polygon-edge server --config /home/ubuntu/polygon/config.yaml

[Install]
WantedBy=multi-user.target
```

### Binario {#binary}

En las cargas de trabajo de producción, los binarios `polygon-edge` solo deberían desplegarse a partir de los binarios publicados y precompilados de GitHub, y no mediante la compilación manual.
:::info

Al compilar manualmente la rama de `develop` de GitHub, puedes introducir cambios de ruptura en tu entorno.   
Por eso, se recomienda desplegar el binario de Polygon Edge exclusivamente a partir de las publicaciones, dado que contendrá
información sobre los cambios de ruptura y cómo superarlos.

:::

Consulta la sección de [Instalación](/docs/edge/get-started/installation) para ver la descripción completa del método de instalación.

### Almacenamiento de datos {#data-storage}

La carpeta `data/` que contiene todo el estado de la cadena de bloques debe ser montada en un disco o volumen dedicado que permita
hacer copias de seguridad automáticas del disco, ampliar el volumen y, opcionalmente, montar el disco o volumen en otra instancia en caso de falla.


### Archivos de registro {#log-files}

Los archivos de registro deben ser rotados diariamente (con una herramienta como `logrotate`)
:::warning

Si se configura sin rotación de registros, los archivos de registro pueden utilizar todo el espacio de disco disponible y eso podría interrumpir el tiempo de funcionamiento del validador.

:::

Ejemplo de configuración `logrotate`:
```
/home/ubuntu/polygon/logs/node.log
{
        rotate 7
        daily
        missingok
        notifempty
        compress
        prerotate
                /usr/bin/systemctl stop polygon-edge.service
        endscript
        postrotate
                /usr/bin/systemctl start polygon-edge.service
        endscript
}
```


Consulta la sección de [Registro](#logging) a continuación para conocer las recomendaciones sobre el almacenamiento de registros.

### Dependencias adicionales {#additional-dependencies}

`polygon-edge` es compilado estáticamente, por lo que no requiere dependencias adicionales del sistema operativo anfitrión.

## Mantenimiento {#maintenance}

A continuación se presentan las mejores prácticas para mantener un nodo validador en funcionamiento de una red de Polygon Edge.

### Copia de seguridad {#backup}

Existen dos tipos de procedimientos de copia de seguridad recomendados para los nodos de Polygon Edge.

Si es posible, se sugiere utilizar ambos, y la copia de seguridad de Polygon Edge siempre es una opción disponible.

* ***Copia de seguridad del volumen***:    
  Copia de seguridad progresiva diaria del volumen del nodo `data/` de Polygon Edge o de la máquina virtual (VM) completa si es posible.


* ***Copia de seguridad de Polygon Edge***:    
  Se recomienda un trabajo de CRON diario que haga copias de seguridad periódicas de Polygon Edge y mueva los archivos `.dat` a una ubicación externa o a un almacenamiento seguro de objetos en la nube.

Lo ideal es que la copia de seguridad de Polygon Edge no se superponga con la copia de seguridad del volumen descrita anteriormente.

Consulta la [instancia de nodo de copia de seguridad o restauración](working-with-node/backup-restore) para conocer las instrucciones sobre cómo hacer copias de seguridad de Polygon Edge.

### Registro {#logging}

Los registros emitidos por los nodos de Polygon Edge deben:
- enviarse a un almacén de datos externo con capacidad de indexación y búsqueda
- tener un período de retención de registros de 30 días

Si es la primera vez que configuras un validador de Polygon Edge, te recomendamos que inicies el nodo
con la opción `--log-level=DEBUG` para poder depurar rápidamente cualquier problema que se te presente.

:::info

La `--log-level=DEBUG`.hará que la salida del registro del nodo sea lo más verbosa posible.   
Los registros de depuración aumentarán drásticamente el tamaño del archivo de registro, lo que debe tenerse en cuenta al configurar
la solución de rotación del registro.

:::
### Parches de seguridad del sistema operativo {#os-security-patches}

Los administradores deben asegurarse de que el sistema operativo de la instancia validadora se actualice siempre con los últimos parches al menos una vez al mes.

## Métricas {#metrics}

### Métricas del sistema {#system-metrics}

Los administradores deben configurar algún tipo de monitor de métricas del sistema, (por ejemplo, Telegraf + InfluxDB + Grafana o un SaaS de terceros).

Métricas que deben monitorearse y tener notificaciones de alarma configuradas:

| Nombre de la métrica | Umbral de alarma |
|-----------------------|-------------------------------|
| Uso de la CPU (%) | > 90 % durante más de 5 minutos |
| Utilización de la RAM (%) | > 90 % durante más de 5 minutos |
| Utilización del disco raíz | > 90 % |
| Utilización de datos en el disco | > 90 % |

### Métricas del validador {#validator-metrics}

Los administradores deben configurar la recopilación de métricas de la API de Prometheus de Polygon Edge para poder
supervisar el rendimiento de la cadena de bloques.

Consulta [las métricas de Prometheus](configuration/prometheus-metrics) para entender qué métricas se exponen y cómo configurar la recopilación de métricas de Prometheus.


Se les debe prestar especial atención a las siguientes métricas:
- ***Tiempo de producción de bloques***: si el tiempo de producción de bloques es superior al normal, existe un potencial problema en la red
- ***Número de rondas de consenso***: si hay más de una ronda, hay un problema potencial en el conjunto de validadores en la red
- ***Número de pares***: si el número de pares disminuye, hay un problema de conectividad en la red

## Seguridad {#security}

A continuación se presentan las mejores prácticas para asegurar un nodo validador en funcionamiento de una red de Polygon Edge.

### Servicios de API {#api-services}

- ***JSON-RPC*** -
Únicamente el servicio de API que debe ser expuesto al público (mediante el equilibrador de carga o directamente)   .
Esta API debe ejecutarse en todas las interfaces o en una dirección IP específica ( ejemplo: `--json-rpc 0.0.0.0:8545`o  `--json-prc 192.168.1.1:8545`).
:::info

Como esta es una API de cara al público, se recomienda tener un equilibrador de carga o un proxy inverso delante de ella para dar seguridad y limitación de tarifas.

:::


- ***LibP2P***
Esta es la API de interconexión utilizada por los nodos para la comunicación entre pares. Debe ejecutarse en todas las interfaces o en una dirección IP específica
( `--libp2p 0.0.0.0:1478`o  `--libp2p 192.168.1.1:1478` ). Esta API no debe estar expuesta públicamente,
pero debe ser accesible desde todos los demás nodos.
:::info

Si se ejecuta en un anfitrión local (`--libp2p 127.0.0.1:1478`) no se podrán conectar otros nodos.

:::


- ***GRPC*** -
Esta API es utilizada sólo para ejecutar comandos de operador y nada más. Como tal, debe ejecutarse exclusivamente en un anfitrión local (`--grpc-address 127.0.0.1:9632`).

### Secretos de Polygon Edge {#polygon-edge-secrets}

Los secretos de Polygon Edge ( claves `ibft` y `libp2p` ) no se deben almacenar en un sistema de archivos   local. En su lugar, se debe utilizar un [administrador de secretos](configuration/secret-managers/set-up-aws-ssm)    compatible.
El almacenamiento de secretos en el sistema de archivos local solo debe utilizarse en entornos que no sean de producción.

## Actualización {#update}

A continuación se encuentra el procedimiento de actualización deseado para los nodos validadores, descrito como instrucciones paso a paso.

### Procedimiento de actualización {#update-procedure}

- Descarga el binario de Polygon Edge más reciente de las [publicaciones](https://github.com/0xPolygon/polygon-edge/releases) oficiales de GitHub
- Detén el servicio de Polygon Edge ( ejemplo: `sudo systemctl stop polygon-edge.service` )
- Sustituye el binario `polygon-edge`existente por el descargado ( ejemplo:  `sudo mv polygon-edge /usr/local/bin/` )
- Revisa si la versión correcta de `polygon-edge`está en su lugar ejecutando `polygon-edge version`. Debe corresponder a la versión publicada más reciente
- Revisa la documentación de la versión si hay algún paso de compatibilidad con versiones anteriores que deba surtirse antes de iniciar el servicio `polygon-edge`
- Inicia el servicio `polygon-edge` ( ejemplo: `sudo systemctl start polygon-edge.service` )
- Por último, comprobar, revisar la salida de registro de y`polygon-edge` asegúrarse de que todo está funcionando sin ningún r`[ERROR]`egistro

:::warning

Cuando hay un lanzamiento de ruptura, este procedimiento de actualización debe realizarse en todos los nodos como
el binario que actualmente se ejecuta compatible no es compatible con la nueva versión.

Esto significa que la cadena debe detenerse durante un breve período de tiempo ( hasta que se sustituyan los `polygon-edge`binarios y se reinicie el servicio )
así que planifica en forma apropiada.

Puedes utilizar herramientas como **[Ansible](https://www.ansible.com/)** o un script personalizado para realizar la actualización de manera eficiente y minimizar el tiempo de inactividad en la cadena
:::

## Procedimiento de inicio {#startup-procedure}

A continuación se muestra el flujo deseado del procedimiento de inicio para el validador de Polygon Edge

- Leer a través de documentos listados en sección [de Base de Knowlege](#knowledge-base)
- Aplicar los últimos parches del SO en el nodo validador
- Descargar el último binario `polygon-edge` desde el GitHub oficial -r[eleases ](https://github.com/0xPolygon/polygon-edge/releases)y colócalo en la instancia local `PATH`
- Inicializar uno de los [administradores](/docs/category/secret-managers) soportados -- el comando `polygon-edge secrets generate`CLI
- Generar y almacenar secretos usando [el comando CLI](/docs/edge/get-started/cli-commands#secrets-init-flags)`polygon-edge secrets init`
- Tome nota de los `Public key (address)`valores `NodeID`y
- Generar el archivo`genesis.json` como se describe en [la configuración de la nube](get-started/set-up-ibft-on-the-cloud#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators) utilizando`polygon-edge genesis` [el comando CLI](/docs/edge/get-started/cli-commands#genesis-flags)
- Generar el archivo de configuración por defecto utilizando [el comando CLI](/docs/edge/configuration/sample-config)`polygon-edge server export`
- Editar `default-config.yaml`archivo para acomodar el entorno de nodo validador (rutas de archivo, etc.)
- Crear un servicio Polygon Edge ( `systemd`o similar) donde `polygon-edge`binario ejecutará el servidor desde un archivo `default-config.yaml`
- Inicia el servidor Polygon Edge iniciando el servicio ( ejemplo: `systemctl start polygon-edge`)
- Comprueba la salida del registro de `polygon-edge`y asegúrate de que los bloques se están generando y que no hay registros `[ERROR]`
- Comprueba la funcionalidad de la cadena llamando a un método JSON-RPC como [`eth_chainId`](/docs/edge/api/json-rpc-eth#eth_chainid)
