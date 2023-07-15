---
id: terraform-aws-deployment
title: Despliegue de Terraform en AWS
description: "Despliega la red Polygon Edge en el proveedor de la nube AWS utilizando Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Guía de despliegue de producción

Esta es la guía de despliegue de AWS oficial, lista para producción, totalmente automatizada.

Se recomienda hacer despliegues manuales en la ***[nube](set-up-ibft-on-the-cloud)*** o ***[en](set-up-ibft-locally)*** la ubicación local
para hacer pruebas o si su proveedor de la nube no es AWS.

:::

:::info

Este despliegue es solo con pruebas de autoridad (PoA).
   Si se necesita el mecanismo de pruebas de participación (PoS), solo hay que seguir esta ***[guía](/docs/edge/consensus/migration-to-pos)*** para hacer el cambio de PoA a PoS.

:::

Esta guía describirá, en detalle, el proceso de despliegue de una red de cadena de bloques de Polygon Edge en el proveedor de la nube de AWS,
que está listo para la producción, ya que los nodos validadores están repartidos en varias zonas de disponibilidad.

## Prerrequisitos {#prerequisites}

### Herramientas del sistema {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [ID de la clave de acceso a AWS y clave de acceso secreta](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Variables de Terraform {#terraform-variables}
Dos variables que se deben proporcionar antes de ejecutar la implementación:

* `alb_ssl_certificate`: el nombre de recursos de Amazon (ARN) del administrador de certificados de AWS que será utilizado por el equilibrador de carga de las aplicaciones (ALB) para el protocolo.   
  El certificado debe generarse antes de iniciar el despliegue y debe tener el estado **emitido**
* `premine`: la cuenta que recibirá la moneda nativa preminada.
El valor debe cumplir con la especificación oficial del indicador [CLI](/docs/edge/get-started/cli-commands#genesis-flags)

## información de despliegue {#deployment-information}
### Recursos desplegados {#deployed-resources}
Descripción general de alto nivel de los recursos que se desplegarán:

* Nube privada virtual (VPC) dedicada
* 4 nodos validadores (que también son nodos de arranque)
* 4 pasarelas de traducción de dirección de la red (NAT) para permitir el tráfico de salida de los nodos de Internet
* Función lambda utilizada para generar el primer bloque (génesis) e iniciar la cadena
* Grupos de seguridad dedicados y roles de IAM
* Bucket S3 utilizado para el almacenamiento del archivo genesis.json
* Equilibrador de carga de aplicaciones usado para exponer el terminal JSON-RPC

### Tolerancia a fallas {#fault-tolerance}

Para este despliegue solo se requieren regiones que tengan 4 zonas de disponibilidad. Cada nodo se despliega en una sola zona de aplicación (AZ).

Al ubicar cada nodo en una única AZ, el conjunto de la cadena de bloques es tolerante a los fallos de un solo nodo (AZ), puesto que Polygon Edge despliega
el consenso de tolerancia a fallas bizantinas de Estambul (IBFT) que permite que un solo nodo falle en un grupo de 4 nodos validadores.

### Acceso a la línea de comandos {#command-line-access}

Los nodos validadores no están expuestos de ninguna manera a la Internet pública ( el acceso a la RPC JSON se hace únicamente por medio del ALB)
y ni siquiera tienen direcciones IP públicas adjuntas a ellos.  
El acceso a la línea de comandos del nodo es posible únicamente a través del [administrador de sesión del administrador de sistemas de AWS](https://aws.amazon.com/systems-manager/features/).

### Actualización de la imagen de máquina de Amazon (AMI) base {#base-ami-upgrade}

Este despliegue utiliza la AMI de AWS `ubuntu-focal-20.04-amd64-server`. Eso **no** desencadenará el *redespliegue* de EC2 si la AMI de AWS se actualiza.

Si, por alguna razón, la AMI base es obligatoria para actualizar,
se puede lograr ejecutando el comando `terraform taint` para cada instancia, antes de `terraform apply`   .
Las instancias se pueden contaminar ejecutando el comando     `terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`
 comando.

Ejemplo:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

En un entorno de producción `terraform taint`debe ser ejecutado uno a uno para mantener la red de la cadena de bloques funcional.

:::

## Procedimiento de despliegue {#deployment-procedure}

### Pasos previos al despliegue {#pre-deployment-steps}
* Lee el archivo Readme de registro de Terraform [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)
* Añade el `polygon-technology-edge`módulo a tu archivo `main.tf` utilizando *las instrucciones* de la página readme de los módulos
* Ejecuta el comando `terraform init`para instalar todas las dependencias necesarias de Terraform
* Proporciona un nuevo certificado en el [administrador de certificados de AWS](https://aws.amazon.com/certificate-manager/)
* Cerciórate de que el certificado suministrado esté en el estado **Emitido** y anota el **ARN** del certificado
* Configura tu estado de salida para obtener la salida de los módulos en el CLI

#### Ejemplo de `main.tf` {#example}
```terraform
module "polygon-edge" {
  source  = "aws-ia/polygon-technology-edge/aws"
  version = ">=0.0.1"

  premine             = var.premine
  alb_ssl_certificate = var.alb_ssl_certificate
}

output "json_rpc_dns_name" {
  value       = module.polygon-edge.jsonrpc_dns_name
  description = "The dns name for the JSON-RPC API"
}

variable "premine" {
  type        = string
  description = "Public account that will receive premined native currency"
}

variable "alb_ssl_certificate" {
  type        = string
  description = "The ARN of SSL certificate that will be placed on JSON-RPC ALB"
}
```

#### Ejemplo de `terraform.tfvars` {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Pasos para el despliegue {#deployment-steps}
* Crea el archivo `terraform.tfvars`
* Establece las variables de Terraform necesarias en este archivo (como ya se explicó).
:::info

Hay otras variables no obligatorias que pueden personalizar plenamente este despliegue
Puedes anular por defecto añadiendo los tuyos al archivo `terraform.tfvars`.

  La especificación de todas las variables disponibles se puede encontrar en el ***[registro](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** de los módulos de Terraform

:::
* Asegúrate de haber configurado correctamente una autenticación de CLI de AWS ejecutando `aws s3 ls`. No debe haber errores.
* Implementa la infraestructura `terraform apply`

### Pasos posteriores al despliegue {#post-deployment-steps}
* Una vez finalizado el despliegue anota el valor de la variable `json_rpc_dns_name`impreso en el CLI
* Crea un cname del DNS público que apunte tu nombre de dominio al valor `json_rpc_dns_name`suministrado. Por ejemplo:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* Cuando el registro cname se propague, comprueba si la cadena funciona correctamente llamando a su extremo de RPC JSON.   
  Del ejemplo anterior:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Procedimiento de destrucción {#destroy-procedure}
:::warning

El siguiente procedimiento eliminará permanentemente toda la infraestructura desplegada con estas secuencias de comandos de Terraform     
Asegúrate de tener [las copias de seguridad de datos de la cadena de bloques](docs/edge/working-with-node/backup-restore) apropiadas o de estar trabajando con un entorno de prueba.

:::

Si necesitas eliminar toda la infraestructura, ejecuta el siguiente comando `terraform destroy`   .
Además, tendrás que eliminar manualmente los secretos almacenados en la [tienda de parámetros](https://aws.amazon.com/systems-manager/features/) de AWS
para la región en la que tuvo lugar el despliegue.
