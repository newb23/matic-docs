---
id: set-up-ibft-locally
title: Configuración local
description: "Guía de configuración local paso a paso"
keywords:
  - docs
  - polygon
  - edge
  - local
  - setup
  - genesis
---

:::caution Esta guía es únicamente para hacer pruebas.

La siguiente guía te indicará cómo configurar una red de Polygon Edge en tu máquina local para propósitos de pruebas
y desarrollo.

El procedimiento difiere mucho de la forma en que hay que configurar la red de Polygon Edge para un escenario de uso real
un proveedor de **[la](/docs/edge/get-started/set-up-ibft-on-the-cloud)** nube:

:::


## Requisitos {#requirements}

Consulta [Instalación](/docs/edge/get-started/installation) para instalar Polygon Edge.

## Descripción general {#overview}

![Configuración local](/img/edge/ibft-setup/local.svg)

En esta guía, nuestro objetivo es crear una `polygon-edge`red de cadenas de bloques que funcione con[ el protocolo de consenso IBFT](https://github.com/ethereum/EIPs/issues/650).
La red de la cadena de bloques constará de cuatro nodos, de los cuales todos son nodos validadores y, por eso, son elegibles tanto para proponer bloques como para validar bloques que vinieron de otros proponentes.
Los cuatro nodos se ejecutarán en la misma máquina, ya que la idea de esta guía es darte un grupo IBFT completamente funcional en la menor cantidad de tiempo.

Para lograrlo, te guiaremos por cuatro sencillos pasos:

1. Inicializar los directorios de datos generará las claves validadores para cada uno de los cuatro nodos e inicializará los directorios de datos vacíos de la cadena de bloques. Las claves validadoras son importantes, ya que debemos arrancar el bloque génesis con el conjunto inicial de validadores que utilizan estas claves.
2. Preparar la cadena de conexión para el nodo de arranque contendrá la información vital para todos los nodos que ejecutemos, en cuanto a cual nodo conectarse la primera vez.
3. Generar el archivo `genesis.json` requerirá, como entrada, las claves validadoras generadas en el **paso 1**, utilizadas para configurar los validadores iniciales de la red en el bloque génesis, y la cadena de conexión del nodo de arranque del **paso 2**.
4. El objetivo de esta guía es ejecutar todos los nodos y será el último paso. Les daremos a los nodos la indicación de qué directorio de datos utilizar y dónde encontrar el `genesis.json`, que arranca el estado de red inicial.

Como los cuatro nodos se ejecutarán en el anfirtrión local, durante el proceso de configuración se espera que todos los directorios de datos
para cada uno de los nodos se encuentren en el mismo directorio primario.

:::info Número de validadores

No hay un número mínimo de nodos en un grupo, lo que significa que puede haber grupos con solo un nodo validador.
Ten en cuenta que con un grupo de _un solo_ nodo, no hay **tolerancia a colapsos** ni **garantías de BFT**.

Se recomiendan mínimo cuatro nodos para lograr la garantía de tolerancia a fallas bizantinas (BFT), ya que, en un grupo de cuatro nodos, la falla de
la falla de un nodo, si los tres nodos restantes funcionan normalmente.

:::

## Paso 1: inicia las carpetas de datos para IBFT y genera las claves validadoras {#step-1-initialize-data-folders-for-ibft-and-generate-validator-keys}

Para empezar a ejecutar con IBFT, debes inicializar las carpetas de datos,
una para cada nodo:

````bash
polygon-edge secrets init --data-dir test-chain-1
````

````bash
polygon-edge secrets init --data-dir test-chain-2
````

````bash
polygon-edge secrets init --data-dir test-chain-3
````

````bash
polygon-edge secrets init --data-dir test-chain-4
````

Cada uno de estos comandos imprimirá la clave validadora, la clave pública BLS y la [ID del nodo](https://docs.libp2p.io/concepts/peer-id/). Para el siguiente paso, necesitarás la ID del primer nodo.

### Secretos de salida {#outputting-secrets}
La salida de los secretos se puede recuperar de nuevo, si es necesario.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

## Paso 2: Preparar la cadena de conexión multidirección para el nodo de arranque {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Para que un nodo logre establecer conectividad, debe saber a qué servidor `bootnode` conectarse para obtener
información sobre todos los nodos restantes en la red. A veces, en la jerga p2p, `bootnode` también se conoce como el servidor `rendezvous`.

`bootnode` no es una instancia especial del nodo de Polygon Edge. Cada nodo de Polygon Edge sirve como un `bootnode`, pero
cada nodo de Polygon Edge necesita tener un conjunto de nodos de arranque especificados que serán contactados, para suministrar información sobre cómo conectar con
todos los nodos restantes en la red.

Para crear la cadena de conexión para especificar el nodo de arranque, necesitaremos ajustarnos
al [formato multidirección](https://docs.libp2p.io/concepts/addressing/):
```
/ip4/<ip_address>/tcp/<port>/p2p/<node_id>
```

En esta guía, trataremos al primer y segundo nodo como nodos de arranque para todos los demás nodos. Lo que sucederá en este escenario
es que los nodos que se conectan a `node 1` o a `node 2` obtendrán información sobre cómo conectarse entre ellos a través de un
nodo de arranque mutuamente contactado.

:::info Debes especificar al menos un nodo de arranque para iniciar un nodo.

Se requiere al menos **un** nodo de arranque para que otros nodos en la red puedan descubrirse entre ellos. Se recomienda que haya más nodos de arranque, ya que
le dan resiliencia a la red en caso de una caída del sistema.
En esta guía, enumeraremos dos nodos, pero eso puede cambiar sobre la marcha, sin que afecte la validez del archivo `genesis.json`.

:::

Dado que estamos ejecutando en un anfitrión local, es seguro asumir que `<ip_address>` es `127.0.0.1`.

Para `<port>`, utilizaremos `10001`, ya que configuraremos el servidor libp2p para que `node 1` escuche en este puerto después.

Por último, necesitamos `<node_id>`, que podemos obtener de los resultados del comando `polygon-edge secrets init --data-dir test-chain-1`, ejecutado anteriormente (que se utilizó para generar claves y directorios de datos para `node1`).

Después del ensamblaje, la cadena de conexión multidirección a `node 1`, que utilizaremos como nodo de arranque, se verá más o menos así (solo que `<node_id>`, que debería estar al final, se debería ver diferente):
```
/ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Del mismo modo, construimos la multidirección para el segundo nodo de arranque, tal como se muestra abajo.
```
/ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```

:::info Nombres de los anfitriones de DNS en vez de IPS

Polygon Edge admite el uso de los nombres de los anfitriones de DNS para la configuración de los nodos. Esa es una característica muy útil para las implementaciones basadas en la nube, ya que la dirección IP del nodo puede cambiar debido a varias razones.

El formato multidirección para la cadena de conexión mientras se usan nombres de anfitriones de DNS es el siguiente:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::


## Paso 3: genera el archivo génesis con los cuatro nodos como validadores {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

````bash
polygon-edge genesis --consensus ibft --ibft-validators-prefix-path test-chain- --bootnode /ip4/127.0.0.1/tcp/10001/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW --bootnode /ip4/127.0.0.1/tcp/20001/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
````

Lo que este comando hace:

* `--ibft-validators-prefix-path` establece la ruta de la carpeta a una especificada, que IBFT en Polygon Edge puede utilizar. Este directorio se usa para almacenar la carpeta `consensus/`, donde se guarda la clave privada del validador. La
clave privada del validador se necesita para construir el archivo génesis, el paso inicial de los nodos de arranque.
Esa indicación solo tiene sentido al configurar la red en el anfitrión local, ya que en un escenario real no esperamos
que todos los directorios de datos de los nodos estén en el mismo sistema de archivos desde donde podamos leer sus claves privadas.
* `--bootnode` establece la dirección del nodo de arranque que habilitará la facultad de los nodos de encontrarse unos a otros.
Usaremos la cadena multidirección de `node 1`, como se menciona en el **paso 2**.

El resultado de este comando es el archivo `genesis.json`, que contiene el bloque génesis de nuestra cadena de bloques nueva, con el conjunto de validadores predefinido y la configuración de cuál nodo se debe contactar primero para establecer la conectividad.

:::info Cambiar a ECDSA

BLS es el modo de validación por defecto de los encabezados de bloque. Si quieres que tu cadena se ejecute en modo ECDSA, puedes utilizar la bandera `—ibft-validator-type`, con el `ecdsa`argumento:

```
genesis --ibft-validator-type ecdsa
```
:::
:::info Preminado de saldos de cuentas

Probablemente quieras configurar tu red de cadena de bloques con algunas direcciones que tengan saldos "preminados".

Para lograrlo, aprueba tantos indicadores `--premine` como quieras por dirección que quieras que inicie con cierto saldo
en la cadena de bloques.

Por ejemplo, si quisiéramos preminar 1000 ETH a la dirección `0x3956E90e632AEbBF34DEB49b71c28A83Bc029862` en nuestro bloque génesis, tendríamos que suministrar el siguiente argumento:

```
--premine=0x3956E90e632AEbBF34DEB49b71c28A83Bc029862:1000000000000000000000
```

**Fíjate que la cantidad preminada está en WEI, no en ETH.**

:::

:::info Establece el límite de gas de los bloques

El límite por defecto de gas de los bloques es `5242880`. Este valor está escrito en el archivo génesis, pero puedes
incrementarlo o reducirlo.

Para ello, debes usar el indicador `--block-gas-limit` seguido del valor deseado, como se muestra a continuación:

```shell
--block-gas-limit 1000000000
```

:::

:::info Establece el límite del descriptor de archivos del sistema.

El límite del descriptor de archivos por defecto (número máximo de archivos abiertos) en algunos sistemas es muy bajo.
Si se espera que los nodos tengan alto rendimiento, podrías aumentar ese límite en el sistema operativo (SO).

Para distribuciones de Ubuntu, el procedimiento es el siguiente (si no estás utilizando la distribución de Ubunto o Debian, revisa los documentos oficiales para tu SO):
- Revisa los límites actuales del SO (archivos abiertos).
```shell title="ulimit -a"
ubuntu@ubuntu:~$ ulimit -a
core file size          (blocks, -c) 0
data seg size           (kbytes, -d) unlimited
scheduling priority             (-e) 0
file size               (blocks, -f) unlimited
pending signals                 (-i) 15391
max locked memory       (kbytes, -l) 65536
max memory size         (kbytes, -m) unlimited
open files                      (-n) 1024
pipe size            (512 bytes, -p) 8
POSIX message queues     (bytes, -q) 819200
real-time priority              (-r) 0
stack size              (kbytes, -s) 8192
cpu time               (seconds, -t) unlimited
max user processes              (-u) 15391
virtual memory          (kbytes, -v) unlimited
file locks                      (-x) unlimited
```

- Incrementa el límite de archivos abiertos.
	- Localmente, solo afecta la sesión actual:
	```shell
	ulimit -u 65535
	```
	- Globalmente o por usuario (agrega límites al final del archivo /etc/security/limits.conf):
	```shell
	sudo vi /etc/security/limits.conf  # we use vi, but you can use your favorite text editor
	```
	```shell title="/etc/security/limits.conf"
	# /etc/security/limits.conf
	#
	#Each line describes a limit for a user in the form:
	#
	#<domain>        <type>  <item>  <value>
	#
	#Where:
	#<domain> can be:
	#        - a user name
	#        - a group name, with @group syntax
	#        - the wildcard *, for default entry
	#        - the wildcard %, can be also used with %group syntax,
	#                 for maxlogin limit
	#        - NOTE: group and wildcard limits are not applied to root.
	#          To apply a limit to the root user, <domain> must be
	#          the literal username root.
	#
	#<type> can have the two values:
	#        - "soft" for enforcing the soft limits
	#        - "hard" for enforcing hard limits
	#
	#<item> can be one of the following:
	#        - core - limits the core file size (KB)
	#        - data - max data size (KB)
	#        - fsize - maximum filesize (KB)
	#        - memlock - max locked-in-memory address space (KB)
	#        - nofile - max number of open file descriptors
	#        - rss - max resident set size (KB)
	#        - stack - max stack size (KB)
	#        - cpu - max CPU time (MIN)
	#        - nproc - max number of processes
	#        - as - address space limit (KB)
	#        - maxlogins - max number of logins for this user

	#        - maxsyslogins - max number of logins on the system
	#        - priority - the priority to run user process with
	#        - locks - max number of file locks the user can hold
	#        - sigpending - max number of pending signals
	#        - msgqueue - max memory used by POSIX message queues (bytes)
	#        - nice - max nice priority allowed to raise to values: [-20, 19]
	#        - rtprio - max realtime priority
	#        - chroot - change root to directory (Debian-specific)
	#
	#<domain>      <type>  <item>         <value>
	#

	#*               soft    core            0
	#root            hard    core            100000
	#*               hard    rss             10000
	#@student        hard    nproc           20
	#@faculty        soft    nproc           20
	#@faculty        hard    nproc           50
	#ftp             hard    nproc           0
	#ftp             -       chroot          /ftp
	#@student        -       maxlogins       4

	*               soft    nofile          65535
	*               hard    nofile          65535

	# End of file
	```
Opcionalmente, modifica los parámetros adicionales, guarda el archivo y reinicia el sistema.
Después de reiniciar, vuelve a revisar el límite del descriptor de archivos.
Debería establecerse al valor que definiste en el archivo limits.conf.

:::


## Paso 4: ejecuta todos los clientes {#step-4-run-all-the-clients}

Como ya estás tratando de ejecutar una red de Polygon Edge que consta de cuatro nodos, todos en la misma máquina, debemos procurar
evitar conflictos de los puertos. Por eso usamos el siguiente razonamiento para determinar los puertos de escucha de cada servidor de un nodo:

- `10000` para el servidor gRPC de `node 1`, `20000` para el servidor GRPC de `node 2`, etc.
- `10001` para el servidor libp2p de `node 1`, `20001` para el servidor libp2p de `node 2`, etc.
- `10002` para el servidor JSON-RPC de `node 1`, `20002` para el servidor JSON-RPC de `node 2`, etc.

Para ejecutar el **primer** cliente (nota el puerto `10001`, ya que se utilizó como parte de la multidirección libp2p en el **paso 2**, junto con la ID de nodo del primer nodo):

````bash
polygon-edge server --data-dir ./test-chain-1 --chain genesis.json --grpc-address :10000 --libp2p :10001 --jsonrpc :10002 --seal
````

Para ejecutar el **segundo** cliente:

````bash
polygon-edge server --data-dir ./test-chain-2 --chain genesis.json --grpc-address :20000 --libp2p :20001 --jsonrpc :20002 --seal
````

Para ejecutar el **tercer** cliente:

````bash
polygon-edge server --data-dir ./test-chain-3 --chain genesis.json --grpc-address :30000 --libp2p :30001 --jsonrpc :30002 --seal
````

Para ejecutar el **cuatro** cliente:

````bash
polygon-edge server --data-dir ./test-chain-4 --chain genesis.json --grpc-address :40000 --libp2p :40001 --jsonrpc :40002 --seal
````

Para revisar brevemente lo que se ha hecho hasta ahora:

* El directorio de datos de los clientes se ha especificado como **./test-chain-\***.
* Los servidores GRPC se han iniciado en los puertos **10000**, **20000**, **30000** y **40000** para cada nodo, respectivamente.
* Los servidores libp2p se han iniciado en los puertos **10001**, **20001**, **30001** y **40001** para cada nodo, respectivamente.
* Los servidores JSON-RPC se han iniciado en los puertos **10002**, **20002**, **30002** y **40002** para cada nodo, respectivamente.
* La indicación *sello* significa que el nodo que se está iniciando participará en el sellado de bloques.
* La indicación *cadena* especifica qué archivo génesis se debería usar para la configuración de la cadena.

La estructura del archivo génesis se detalla en la sección de [comandos CLI](/docs/edge/get-started/cli-commands).

Después de ejecutar los comandos anteriores, has configurado una red de cuatro nodos de Polygon Edge, capaz de sellar bloques y recuperarse
de fallos de nodos.

:::info Inicia el cliente con el archivo de configuración

En lugar de especificar todos los parámetros de configuración como argumentos CLI, el cliente también puede comenzar a utilizar un archivo de configuración ejecutando el siguiente comando:

````bash
polygon-edge server --config <config_file_path>
````
Ejemplo:

````bash
polygon-edge server --config ./test/config-node1.json
````
Actualmente, apoyamos `yaml`y `json`basamos los archivos de configuración, aquí se pueden encontrar los **[archivos](/docs/edge/configuration/sample-config)** de configuración de la muestra

:::

:::info Pasos para ejecutar un nodo no validador

Un no validador siempre sincronizará los bloques más recientes recibidos del nodo validador. Puedes iniciar un nodo validador ejecutando el siguiente comando.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename> --grpc-address <portNo> --libp2p <portNo> --jsonrpc <portNo>
````
Por ejemplo, puedes añadir el **quinto** cliente no validador mediante la ejecución del siguiente comando:

````bash
polygon-edge server --data-dir ./test-chain --chain genesis.json --grpc-address :50000 --libp2p :50001 --jsonrpc :50002
````
:::

:::info Especifica el límite del precio

Un nodo de Polygon Edge se puede iniciar con un **límite del precio** establecido para las transacciones entrantes.


La unidad del límite del precio es `wei`.

Establecer un límite del precio significa que cualquier transacción procesada por el nodo actual deberá tener un precio de gas **más alto**
y un límite del precio; de otro modo, no se incluirá en un bloque.

El hecho de que la mayoría de los nodos respeten un determinado límite del precio hace cumplir la regla de que las transacciones en la red
no pueden estar por debajo de cierto umbral del precio.

El valor por defecto del límite del precio es `0`, lo que significa que, por defecto, no se aplica.

Ejemplo de uso del indicador `--price-limit`:
````bash
polygon-edge server --price-limit 100000 ...
````

Cabe señalar que los límites de los precios **solo se hacen cumplir en las transacciones no locales**, es decir,
que el límite del precio no aplica a las transacciones añadidas localmente en el nodo.

:::

:::info URL de WebSocket

Por defecto, al ejecutar Polygon Edge, se genera un URL de WebSocket con base en la ubicación de la cadena.
El esquema de URL `wss://` se utiliza para enlaces de HTTPS y `ws://` para HTTP.

URL de WebSocket del anfitrión local:
````bash
ws://localhost:10002/ws
````
Fíjate que el número del puerto depende del puerto RPC JSON elegido para el nodo.

URL de Edgenet WebSocket:
````bash
wss://rpc-edgenet.polygon.technology/ws
````
:::



## Paso 5: interactúa con la red de Polygon Edge {#step-5-interact-with-the-polygon-edge-network}

Ahora que has configurado por lo menos un cliente activo, puedes interactuar con la cadena de bloques mediante el uso de la cuenta que ya preminaste anteriormente
y especificando el URL de RPC JSON a cualquiera de los cuatro nodos:
- Nodo 1: `http://localhost:10002`
- Nodo 2: `http://localhost:20002`
- Nodo 3: `http://localhost:30002`
- Nodo 4: `http://localhost:40002`

Sigue esta guía para emitir comandos de operador al grupo recién construido: [Cómo consultar información del operador](/docs/edge/working-with-node/query-operator-info) (los puertos de GRPC del grupo que hemos construido son `10000`, `20000`, `30000` y `40000`, respectivamente)
