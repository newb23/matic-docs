---
id: set-up-ibft-on-the-cloud
title: Configuración de la nube
description: "Guía de configuración de la nube paso a paso"
keywords:
  - docs
  - polygon
  - edge
  - cloud
  - setup
  - genesis
---

:::info Esta guía es para las configuraciones de la red principal o la red de pruebas.

La siguiente guía te enseñará cómo configurar una red Polygon Edge en un proveedor de nube para una configuración de producción de tu red de prueba o la red principal.

Si deseas configurar una red Polygon Edge localmente para poner a prueba rápidamente al `polygon-edge`antes de hacer una configuración de tipo productivo, consulta
**[Configuración local](/docs/edge/get-started/set-up-ibft-locally)**
:::

## Requisitos {#requirements}

Consulta [Instalación](/docs/edge/get-started/installation) para instalar Polygon Edge.

### Configuración de la conectividad de la máquina virtual {#setting-up-the-vm-connectivity}

Dependiendo del proveedor de la nube que hayas elegido, puedes configurar la conectividad y las reglas entre las máquinas virtuales mediante un cortafuegos,
grupos de seguridad o listas de control de acceso.

Como la única parte de `polygon-edge` que necesita ser expuesta a otras máquinas virtuales es el servidor libp2p, simplemente permitir
toda la comunicación entre las máquinas virtuales en el puerto libp2p `1478` por defecto es suficiente.

## Descripción general {#overview}

![Configuración de la nube](/img/edge/ibft-setup/cloud.svg)

En esta guía, nuestro objetivo es crear una red de cadenas de bloques de `polygon-edge` que funcione con el [protocolo de consenso tolerante a fallas bizantinas de Estambul (IBFT)](https://github.com/ethereum/EIPs/issues/650).
La red de la cadena de bloques constará de 4 nodos, de los cuales todos son nodos validadores y, como tal, son elegibles tanto para proponer bloques como para validar bloques que vengan de otros proponentes.
Cada uno de los 4 nodos se ejecutará en su propia máquina virtual, ya que la idea de esta guía es ofrecerte una red Polygon Edge totalmente funcional, manteniendo las claves del validador privadas para asegurar una configuración de red sin confianza.

Para lograrlo, te guiaremos por 4 sencillos pasos:

0. Échale un vistazo a la lista de **Requisitos** anterior
1. Genera las claves privadas para cada uno de los validadores e inicializa el directorio de datos
2. Prepara la cadena de conexión para el nodo de arranque que se pondrá en el `genesis.json` compartido
3. Crea el `genesis.json` en tu máquina local y enviarlo o transferirlo a cada uno de los nodos
4. Inicia todos los nodos

:::info Número de validadores

No hay un número mínimo de nodos en un grupo, lo que significa que puede haber grupos con solo un nodo validador.
Ten en cuenta que con un grupo de _un solo_ nodo, no hay **tolerancia a colapsos** ni **garantías de BFT**.

Se recomiendan mínimo cuatro nodos para lograr la garantía de tolerancia a fallas bizantinas (BFT), ya que, en un grupo de cuatro nodos, la falla de
un nodo se puede tolerar, si los tres nodos restantes funcionan normalmente.

:::

## Paso 1: Inicializa las carpetas de datos y genera las claves de validador {#step-1-initialize-data-folders-and-generate-validator-keys}

Para ejecutar Polygon Edge es necesario que inicialices las carpetas de datos en cada nodo:


````bash
node-1> polygon-edge secrets init --data-dir data-dir
````

````bash
node-2> polygon-edge secrets init --data-dir data-dir
````

````bash
node-3> polygon-edge secrets init --data-dir data-dir
````

````bash
node-4> polygon-edge secrets init --data-dir data-dir
````

Cada uno de estos comandos imprimirá la clave validadora, la clave pública BLS y la [ID del nodo](https://docs.libp2p.io/concepts/peer-id/). Para el siguiente paso, necesitarás la ID del primer nodo.

### Secretos de salida {#outputting-secrets}
La salida de los secretos se puede recuperar de nuevo, si es necesario.

```bash
polygon-edge secrets output --data-dir test-chain-4
```

:::warning ¡Guarda tu directorio de datos y no lo compartas!

Los directorios de datos generados con anterioridad, además de inicializar los directorios para mantener el estado de la cadena de bloques también generan las claves privadas de tu validador.
**¡Esta clave debe mantenerse en secreto, ya que el robo de la misma haría posible que alguien se hiciera pasar por el validador en la red!**

:::

## Paso 2: Preparar la cadena de conexión multidirección para el nodo de arranque {#step-2-prepare-the-multiaddr-connection-string-for-the-bootnode}

Para que un nodo logre establecer conectividad, debe saber a cuál servidor `bootnode` conectarse para obtener
información sobre todos los nodos restantes en la red. A veces, en la jerga p2p, `bootnode` también se conoce como el servidor `rendezvous`.

`bootnode` no es una instancia especial de un nodo de Polygon Edge. Cada nodo del Polygon Edge puede servir como un `bootnode`y
cada nodo de Polygon Edge debe tener un conjunto de nodos de arranque especificados que serán contactados para proporcionar información sobre cómo conectarse con
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

Ya que la primera parte de la cadena de conexión multidirección es el `<ip_address>`, aquí , deberás introducir la dirección IP para que sea contactable por otros nodos; dependiendo de tu configuración, esta puede ser privada o pública, no`127.0.0.1`

Para el `<port>` utilizaremos `1478`, ya que es el puerto por defecto de libp2p.

Por último, necesitamos `<node_id>`, que podemos obtener de los resultados del comando `polygon-edge secrets init --data-dir data-dir`, ejecutado anteriormente (que se utilizó para generar claves y directorios de datos para `node 1`).

Después del ensamblaje, la cadena de conexión multidirección a `node 1`, que utilizaremos como nodo de arranque, se verá más o menos así (solo que `<node_id>`, que está al final, debe ser diferente):
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmJxxH1tScDX2rLGSU9exnuvZKNM9SoK3v315azp68DLPW
```
Del mismo modo, construimos multidirección parda el segundo nodo de arranque, tal como se muestra a continuación.
```
/ip4/<public_or_private_ip>/tcp/1478/p2p/16Uiu2HAmS9Nq4QAaEiogE4ieJFUYsoH28magT7wSvJPpfUGBj3Hq
```
:::info Nombres de los anfitriones de DNS en vez de IPS

Polygon Edge admite el uso de los nombres de los anfitriones de DNS para la configuración de los nodos. Esa es una característica muy útil para las implementaciones basadas en la nube, ya que la dirección IP del nodo puede cambiar debido a varias razones.

El formato multidirección para la cadena de conexión mientras se usan nombres de anfitriones de DNS es el siguiente:
`/dns4/sample.hostname.com/tcp/<port>/p2p/nodeid`

:::

## Paso 3: genera el archivo génesis con los 4 nodos como validadores {#step-3-generate-the-genesis-file-with-the-4-nodes-as-validators}

Este paso se puede ejecutar en tu máquina local, pero se necesitarán las claves públicas del validador para cada uno de los 4 validadores.

Los validadores podrán compartir con seguridad el `Public key (address)` como se muestra más adelante en la salida a sus comandos `secrets init` de modo que
puedes generar de forma segura el genesis.json con esos validadores en el conjunto inicial de validadores, identificados con sus claves públicas:

```
[SECRETS INIT]
Public key (address) = 0xC12bB5d97A35c6919aC77C709d55F6aa60436900
BLS Public key       = 0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf
Node ID              = 16Uiu2HAmVZnsqvTwuzC9Jd4iycpdnHdyVZJZTpVC8QuRSKmZdUrf
```

Ya que recibiste las 4 claves públicas de los validadores, puede ejecutar el siguiente comando para generar el `genesis.json`.

````bash
polygon-edge genesis --consensus ibft --ibft-validator 0xC12bB5d97A35c6919aC77C709d55F6aa60436900:0x9952735ca14734955e114a62e4c26a90bce42b4627a393418372968fa36e73a0ef8db68bba11ea967ff883e429b3bfdf --ibft-validator <2nd validator IBFT public key>:<2nd validator BLS public key> --ibft-validator <3rd validator IBFT public key>:<3rd validator BLS public key> --ibft-validator <4th validator IBFT public key>:<4th validator BLS public key> --bootnode=<first_bootnode_multiaddr_connection_string_from_step_2> --bootnode <second_bootnode_multiaddr_connection_string_from_step_2> --bootnode <optionally_more_bootnodes>
````

Lo que este comando hace:

* El `--ibft-validator` establece la clave pública del validador que debería incluirse en el conjunto inicial de validadores en el bloque génesis. Puede haber muchos validadores iniciales.
* El `--bootnode` establece la dirección del nodo de arranque que posibilitará que los nodos se encuentren entre sí.
Utilizaremos la cadena multidirección del `node 1`, como se menciona en el **paso 2**, aunque puedes añadir tantos nodos de arranque como desees, como ya se mostró.

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

Después de especificar el:
1. Claves públicas de los validadores que se incluirán en el bloque génesis como conjunto de validadores
2. Cadenas de conexión multidirección del nodo de arranque
3. Cuentas y saldos preminados que se incluirán en el bloque génesis

y generando el `genesis.json`, deberías copiarlo en todas las máquinas virtuales de la red. Dependiendo de tu configuración puedes
copiar y pegar, enviarlo al operador del nodo o simplemente entregarlo por SCP o FTP.

La estructura del archivo génesis se detalla en la sección de [comandos CLI](/docs/edge/get-started/cli-commands).

## Paso 4: ejecuta todos los clientes {#step-4-run-all-the-clients}

:::note Conexión en red con los proveedores de la nube

La mayoría de los proveedores de la nube no muestran las direcciones IP (especialmente las públicas) como una interfaz de red directa en tu máquina virtual, sino que configuran un proxy NAT invisible.


Para permitir que los nodos se conecten entre sí en este caso tendrías que escuchar en la dirección IP `0.0.0.0`para enlazar en todas las interfaces, pero aún tendrías que especificar la dirección IP o la dirección DNS que otros nodos pueden utilizar para conectarse a tu instancia. Eso se logra usando el argumento `--dns`o `--nat` donde puedes indicar tu dirección IP externa o DNS respectivamente.

#### Ejemplo {#example}

La dirección IP asociada que deseas escuchar es `192.0.2.1`, pero no está directamente asociada a ninguna de tus interfaces de red.

Para permitir que los nodos se conecten hay que pasar los siguientes parámetros:

`polygon-edge ... --libp2p 0.0.0.0:10001 --nat 192.0.2.1`

O, si deseas especificar una dirección DNS `dns/example.io`, pasa los siguientes parámetros:

`polygon-edge ... --libp2p 0.0.0.0:10001 --dns dns/example.io`

Eso haría que tu nodo escuchara en todas las interfaces, pero también que supiera que los clientes se están conectando a él mediante la dirección `--nat`o `--dns`especificada.

:::

Para ejecutar el **primer** cliente:


````bash
node-1> polygon-edge server --data-dir ./data-dir --chain genesis.json  --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para ejecutar el **segundo** cliente:

````bash
node-2> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para ejecutar el **tercer** cliente:

````bash
node-3> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Para ejecutar el **cuatro** cliente:

````bash
node-4> polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat <public_or_private_ip> --seal
````

Después de ejecutar los comandos anteriores, habrás configurado una red de 4 nodos de Polygon Edge, capaz de sellar bloques y recuperarse
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
Actualmente, solo soportamos el archivo de configuración `json`basado **[en](/docs/edge/configuration/sample-config)** , el archivo de configuración de la muestra se puede encontrar aquí

:::

:::info Pasos para ejecutar un nodo no validador

Un no validador siempre sincronizará los bloques más recientes recibidos del nodo validador. Puedes iniciar un nodo validador ejecutando el siguiente comando.

````bash
polygon-edge server --data-dir <directory_path> --chain <genesis_filename>  --libp2p <IPAddress:PortNo> --nat <public_or_private_ip>
````
Por ejemplo, puedes añadir el **quinto** cliente no validador mediante la ejecución del siguiente comando:

````bash
polygon-edge server --data-dir ./data-dir --chain genesis.json --libp2p 0.0.0.0:1478 --nat<public_or_private_ip>
````
:::

:::info Especifica el límite del precio

Un nodo de Polygon Edge se puede iniciar con un **límite del precio** establecido para las transacciones entrantes.


La unidad del límite del precio es `wei`.

Establecer un límite del precio significa que cualquier transacción procesada por el nodo actual deberá tener un precio de gas **más alto**
que el límite de precio establecido, de lo contrario no se incluirá en un bloque.

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
