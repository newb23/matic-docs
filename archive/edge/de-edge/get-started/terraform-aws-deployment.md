---
id: terraform-aws-deployment
title: Terraform AWS Bereitstellung
description: "Bereitstellen des Polygon Edge-Netzwerks auf dem AWS-Cloud-Anbieter mit Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Leitfaden zur Produktionsbereitstellung

Dies ist der offizielle, produktionsreife, vollständig automatisierte AWS-Bereitstellungsleitfaden.

Manuelle Bereitstellungen in der ***[Cloud](set-up-ibft-on-the-cloud)*** oder ***[lokal](set-up-ibft-locally)***
werden für Tests empfohlen und/oder wenn dein Cloud-Anbieter nicht AWS ist.
:::

:::info

Diese Bereitstellung ist nur PoA.   
Wenn du einen PoS-Mechanismus brauchst, folge einfach diesem ***[Leitfaden](/docs/edge/consensus/migration-to-pos)***, um von PoA zu PoS zu wechseln.

:::

In diesem Leitfaden wird detailliert beschrieben, wie ein Polygon Edge-Blockchain-Netzwerk auf dem AWS Cloud-Anbieter
bereitgestellt wird. Dieses Netzwerk ist produktionsbereit, da die Prüfknoten über mehrere Verfügbarkeitszonen verteilt sind.

## Voraussetzungen {#prerequisites}

### System-Tools {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [aws access key ID und secret access key](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Terraform Variablen {#terraform-variables}
Zwei Variablen, die bereitgestellt werden müssen, bevor du die Bereitstellung durchführst:

* `alb_ssl_certificate` - die ARN des Zertifikats aus dem AWS Certificate Manager, das vom ALB für das https-Protokoll verwendet werden soll.   
 Das Zertifikat muss vor dem Start der Bereitstellung erstellt werden und den Status **ausgestellt** haben.
* `premine` - das Konto, das die vorabgebaute (Pre-Mining) native Währung erhält.
Der Wert muss der offiziellen [CLI](/docs/edge/get-started/cli-commands#genesis-flags)-Flag-Spezifikation entsprechen

## Informationen zur Bereitstellung {#deployment-information}
### Bereitgestellte Ressourcen {#deployed-resources}
Überblick über die Ressourcen, die bereitgestellt werden sollen:

* Dedizierter VPC
* 4 Prüfknoten (die auch Boot-Knoten sind)
* 4 NAT-Gateways, um Knoten für den ausgehenden Internetverkehr zuzulassen
* Lambda-Funktion zur Generierung des ersten (Genesis-)Blöcke und zum Starten der Chain
* Dedizierte Sicherheitsgruppen und IAM-Rollen
* S3 Bucket für die Speicherung der genesis.json-Datei
* Anwendungs-Load-Balancer, der für die Bereitstellung des JSON-RPC-Endpunkts verwendet wird

### Fehlertoleranz {#fault-tolerance}

Für diese Bereitstellung werden nur Regionen mit 4 Verfügbarkeitszonen benötigt. Jeder Knoten ist in einem einzelnen AZ bereitgestellt.

Durch die Platzierung jedes Knotens in einem einzelnen AZ ist der gesamte Blockchain-Cluster fehlertolerant gegenüber dem Ausfall eines einzelnen Knotens (AZ). Polygon Edge implementiert den IBFT-
Konsens, der den Ausfall eines einzelnen Knotens in einem Cluster aus 4 Prüfknoten ermöglicht.

### Befehlszeilenzugriff {#command-line-access}

Die Prüfknoten sind in keinster Weise dem öffentlichen Internet ausgesetzt (auf JSON-PRC wird nur über ALB zugegriffen)
und sie haben nicht einmal öffentliche IP-Adressen.  
Der Zugriff auf die Befehlszeile des Knotens ist nur über [den AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/) möglich.

### Grundlegendes AMI-Upgrade {#base-ami-upgrade}

Diese Bereitstellung verwendet `ubuntu-focal-20.04-amd64-server` AWS AMI. Es wird **keine** erneute EC2-*Bereitstellung* ausgelöst, wenn das AWS AMI aktualisiert wird.

Wenn aus irgendeinem Grund das Basis-AMI aktualisiert werden muss,
kann dies erreicht werden, indem der Befehl `terraform taint` für jede Instanz vor `terraform apply` ausgeführt wird.   
Instanzen können durch den Befehl    
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance` beschädigt werden.

Beispiel:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

In einer Produktionsumgebung sollte `terraform taint` einzeln nacheinander ausgeführt werden, um das Blockchain-Netzwerk funktionsfähig zu halten.

:::

## Bereitstellungsverfahren {#deployment-procedure}

### Schritte zur Vorbereitung der Bereitstellung {#pre-deployment-steps}
* Lies dir die Readme-Seite der Terraform [Polygon-Technology-Edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) durch
* Füge das `polygon-technology-edge` Modul deiner `main.tf`-Datei hinzu, indem du die *Breitstellungs-Anweisungen* auf der Readme-Seite der Module verwendest.
* Führe den Befehl `terraform init` aus, um alle notwendigen Terraform-Abhängigkeiten zu installieren.
* Stelle ein neues Zertifikat im [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/) bereit.
* Vergewissere dich, dass sich das bereitgestellte Zertifikat im Status **Ausgestellt** befindet und notiere dir die **ARN** des Zertifikats.
* Richte deine Ausgabeanweisung ein, um die Ausgabe der Module in CLI zu erhalten.

#### `main.tf` Beispiel {#example}
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

#### `terraform.tfvars` Beispiel {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Schritte zur Bereitstellung {#deployment-steps}
* Erstelle die `terraform.tfvars`-Datei.
* Stelle die erforderlichen Terraform-Variablen in dieser Datei ein (wie oben erklärt).
:::info

Es gibt noch weitere, nicht obligatorische Variablen, mit denen du diese Bereitstellung vollständig anpassen kannst.
Du kannst die Standardwerte außer Kraft setzen, indem du deine eigenen Werte in die `terraform.tfvars`-Datei einträgst.

Die Angabe aller verfügbaren Variablen findest du in der Terraform-***[Registry](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** der Module

:::
* Vergewissere dich, dass du die aws cli-Authentifizierung richtig eingerichtet hast, indem du `aws s3 ls` ausführst - es sollten keine Fehler auftreten.
* Stelle die Infrastruktur `terraform apply` bereit.

### Schritte nach der Bereitstellung {#post-deployment-steps}
* Sobald die Bereitstellung abgeschlossen ist, notiere dir den Wert der Variablen `json_rpc_dns_name`, der in cli erscheint.
* Erstelle einen öffentlichen dns cname-Eintrag, der deinen Domänennamen mit dem angegebenen `json_rpc_dns_name` Wert ausrichtet. Beispiel:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* Sobald der cname-Datensatz übertragen wurde, überprüfe, ob die Chain richtig funktioniert, indem du deinen JSON-PRC-Endpunkt    aufrufst.
  Aus dem obigen Beispiel:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Zerstörungsverfahren {#destroy-procedure}
:::warning

Das folgende Verfahren löscht deine gesamte Infrastruktur, die mit diesen Terraform-Skripten eingerichtet wurde.    
Vergewissere dich, dass du ordnungsgemäße [Blockchain-Datensicherungen](docs/edge/working-with-node/backup-restore) hast und/oder mit einer Testumgebung arbeitest.

:::

Falls du die gesamte Infrastruktur entfernen musst, führe folgenden Befehl aus `terraform destroy`.   
Außerdem musst du die im AWS [Parameter Store](https://aws.amazon.com/systems-manager/features/) gespeicherten Geheimnisse für die Region,
in der die Bereitstellung stattfand, manuell entfernen.
