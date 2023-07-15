---
id: terraform-aws-deployment
title: Развертывание AWS с помощью Terraform
description: "Развертывание сети Polygon Edge на облачном провайдере AWS с помощью Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Руководство по развертыванию
Это официальное готовое к применению и полностью автоматизированное руководство по развертыванию AWS.

Развертывание вручную в ***[облаке](set-up-ibft-on-the-cloud)*** или ***[локально](set-up-ibft-locally)*** рекомендуется для тестирования и/или если ваш облачный провайдер не AWS.
:::

:::info
Данное развертывание применяется только для PoA.    Если необходим механизм PoS, просто следуйте этому ***[руководству](/docs/edge/consensus/migration-to-pos)***, чтобы переключиться с PoA на PoS.
:::

В данном руководстве будет подробно описан процесс развертывания сети блокчейн Polygon Edge на облачном провайдере AWS, которая готова к производству, поскольку ноды валидаторов распределены по нескольким зонам доступности.

## Предварительные условия {#prerequisites}

### Системные инструменты {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [идентификатор ключа доступа к aws и секретный ключ доступа](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Переменные Terraform {#terraform-variables}
Перед запуском развертывания необходимо предоставить две переменные:

* `alb_ssl_certificate`— ARN сертификата от диспетчера сертификатов AWS, который будет использоваться ALB для протокола http.    Перед началом развертывания необходимо создать сертификат, и он должен иметь статус **Выдан**
* `premine` — аккаунт, на который будет поступать предварительно добытая нативная валюта. Значение должно соответствовать официальной спецификации флага [CLI](/docs/edge/get-started/cli-commands#genesis-flags)

## Информация о развертывании {#deployment-information}
### Развернутые ресурсы {#deployed-resources}
Высокоуровневый обзор ресурсов, которые будут развернуты:

* Выделенный VPC
* 4 нода валидаторов (которые также являются загрузочными узлами)
* 4 шлюза NAT, чтобы разрешить нодам исходящий интернет-трафик
* Функция Lambda, используемая для генерации первого (генезисного) блока и запуска цепочки
* Выделенные группы безопасность и роли IAM
* Выделенная память S3, используемая для хранения файла genesis.json
* Балансировщик нагрузки приложения, используемый для открытия конечной точки JSON-RPC

### Отказоустойчивость {#fault-tolerance}

Для такого развертывания требуется только регионы, имеющие 4 зоны доступности. Каждый нод развертывается в одиночном AZ.

Благодаря размещению каждого нода на одиночном AZ весь кластер блокчейна отказоустойчив к поломке одиночного нода (AZ), поскольку Polygon Edge реализует консенсус IBFT, который допускает отказ одного нода в кластере из 4 нодов-валидаторов.

### Доступ к командной строке {#command-line-access}

Ноды-валидаторы никак не открыты для публичного доступа в интернет (доступ к JSON-PRC осуществляется только через ALB), и у них даже нет публичных IP-адресов, привязанных к ним.   Доступ к командной строке нод возможен только через [AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/).

### Обновление AMI Base {#base-ami-upgrade}

Данное развертывание использует `ubuntu-focal-20.04-amd64-server`AWS AMI. При обновлении AWS AMI *повторное развертывание* EC2 **не** предусмотрено.

Если по каким-то причинам требуется обновление базы AMI, это можно осуществить, запустив перед этим команду `terraform taint` для каждого отдельного экземпляра `terraform apply`.    Экземпляры можно задействовать, запустив     `terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`команду.

Пример:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info
В производственной среде `terraform taint`должны запускаться один за другим, чтобы поддерживать функциональность сети блокчейн.
:::

## Процедура развертывания {#deployment-procedure}

### Шаги перед развертыванием {#pre-deployment-steps}
* прочитайте файл readme реестра terraform [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)
* добавьте модуль `polygon-technology-edge` в ваш файл `main.tf`с помощью *инструкций по обеспечению* на странице readme модулей
* запустите команду `terraform init`, чтобы установить все необходимые зависимые Terraform
* предоставьте новый сертификат в [Диспетчер сертификатов AWS](https://aws.amazon.com/certificate-manager/)
* убедитесь, что предоставленный сертификат имеет статус **Выдан**, и обратите внимание на сертификат **ARN**
* настройте оператор вывода, чтобы получить вывод модулей в cli

#### `main.tf`пример {#example}
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

#### `terraform.tfvars`пример {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Шаги по развертыванию {#deployment-steps}
* создайте файл `terraform.tfvars`
* установите требуемые переменные terraform в файл (как поясняется выше).:::info
Существуют и другие необязательные переменные, которые могут полностью настроить это развертывание. Вы можете отменить значения по умолчанию путем добавления своих собственных в файл `terraform.tfvars`.

Спецификации всех доступных переменных можно найти в ***[реестре](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** модулей Terraform
:::
* убедитесь, что вы правильно установили аутентификацию aws cli, запустив `aws s3 ls`, — там не должно быть никаких ошибок.
* разверните инфраструктуру `terraform apply`

### Шаги после развертывания {#post-deployment-steps}
* после завершения развертывания обратите внимание на значение переменной `json_rpc_dns_name` в cli
* создайте публичную запись dns cname, указывающую ваше доменное имя на предоставленное значение`json_rpc_dns_name`. Например:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* как только запись cname распространится, проверьте, правильно ли работает цепочка, путем вызова конечной точки JSON-PRC.    Из приведенного выше примера:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Процедура уничтожения {#destroy-procedure}
:::warning
Следующая процедура будет постоянно удалять всю вашу инфраструктуру, развернутую с помощью этих скриптов terraform.     Убедитесь, что у вас есть надлежащие [резервные копии данных блокчейна](docs/edge/working-with-node/backup-restore) и/или вы работаете с тестовой средой.
:::

Если вам нужно удалить всю инфраструктуру, запустите следующую команду `terraform destroy`.    Кроме того, вам нужно вручную удалить секреты, хранящиеся в [магазине параметров](https://aws.amazon.com/systems-manager/features/) AWS, для региона, в котором осуществлялось развертывание.
