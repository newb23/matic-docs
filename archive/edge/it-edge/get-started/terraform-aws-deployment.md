---
id: terraform-aws-deployment
title: Implementazione di AWS Terraform
description: "Implementa la rete Polygon Edge sul provider cloud AWS utilizzando Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Guida all'implementazione della produzione
Questa è la guida all'implementazione di AWS ufficiale, pronta per la produzione e completamente automatizzata.

Sono consigliate implementazioni del manuale sul ***[Cloud](set-up-ibft-on-the-cloud)*** o ***[Locali](set-up-ibft-locally)*** per i test e/o se il tuo provider cloud non è AWS.
:::

:::info

Questa implementazione è solo PoA.   
Se è necessario il meccanismo PoS, basta che segui questa ***[guida](/docs/edge/consensus/migration-to-pos)*** per passare ora da PoA a PoS.

:::

Questa guida descriverà in dettaglio il processo di implementazione di una rete di blockchain Polygon Edge sul provider di servizi cloud AWS, che è pronto per la produzione poiché i nodi del validatore sono distribuiti su più zone di disponibilità.

## Prerequisiti {#prerequisites}

### Strumenti di sistema {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [ID della chiave di accesso aws e chiave di accesso segreta](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Variabili Terraform {#terraform-variables}
Due variabili che devono essere fornite, prima di eseguire la distribuzione:

* `alb_ssl_certificate` - l'ARN del certificato dal Certificate Manager AWS che deve essere utilizzato da ALB per il protocollo https.   
  Il certificato deve essere generato prima di avviare l'implementazione, e deve avere lo stato di **Emesso**
* `premine` - l'account che riceverà valuta nativa preminata.
Il valore deve seguire la specifica ufficiale del flag [CLI](/docs/edge/get-started/cli-commands#genesis-flags)

## Informazioni sull'implementazione {#deployment-information}
### Risorse implementate {#deployed-resources}
Panoramica di alto livello delle risorse che verranno implementate:

* VPC dedicato
* 4 nodi validatore (che sono anche nodi di avvio)
* 4 gateway NAT per consentire ai nodi il traffico internet in uscita
* Funzione Lambda utilizzata per generare il primo blocco (genesi) e avviare la catena
* Gruppi di sicurezza dedicati e ruoli IAM
* Bucket S3 utilizzato per archiviare il file genesis.json
* Application Load Balancer utilizzato per esporre l'endpoint JSON-RPC

### Tolleranza ai guasti {#fault-tolerance}

Per questa implementazione sono necessarie solo le regioni che dispongono di 4 zone di disponibilità. Ogni nodo viene implementato in una singola zona di disponibilità.

Posizionando ogni nodo in una singola zona di disponibilità AZ, l'intero cluster blockchain è tollerante ai guasti di un singolo nodo (AZ), poiché Polygon Edge implementa il consensus IBFT che consente a un singolo nodo di fallire in un cluster di 4 nodi del validatore.

### Accesso alla linea di comando {#command-line-access}

I nodi del validatore non sono esposti in alcun modo alla rete internet pubblica (JSON-PRC è accessibile solo tramite ALB)  non hanno neppure indirizzi IP pubblici collegati.  
L'accesso alla linea di comando del nodo è possibile solo tramite [AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/).

### Aggiornamento dell'AMI di base {#base-ami-upgrade}

Questa implementazione utilizza `ubuntu-focal-20.04-amd64-server` l'AMI AWS. **Non ** attiverà la *reimplementazione di EC2*  se l'AMI AWS viene aggiornata.

Se, per qualche ragione, è necessario che l'AMI base venga aggiornata, si può ottenere eseguendo prima il `terraform taint` comando per ogni istanza `terraform apply`.   
Le istanze possono essere contaminate eseguendo il    
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance` comando.

Esempio:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

In un ambiente di produzione `terraform taint` dovrebbe essere eseguito uno per uno per mantenere funzionale la rete blockchain.

:::

## Procedura di implementazione {#deployment-procedure}

### Passi preliminari all'implementazione {#pre-deployment-steps}
* leggi il file readme del registro terraform [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)
* aggiungi il modulo `polygon-technology-edge` al tuo `main.tf` file utilizzando *le istruzioni di fornitura* sulla pagina readme dei moduli
* esegui il comando `terraform init` per installare tutte le dipendenze Terraform necessarie
* fornisci un nuovo certificato in [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* assicurati che il certificato fornito sia nello stato **Emesso** e annota l'**ARN** del certificato
* imposta la tua dichiarazione di output per ottenere l'output dei moduli nel cli

#### `main.tf` esempio {#example}
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

#### `terraform.tfvars` esempio {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Passi per l'implementazione {#deployment-steps}
* crea il `terraform.tfvars` file
* imposta le variabili del terraform richieste in questo file (come spiegato sopra).
:::info
Ci sono altre variabili non obbligatorie che possono personalizzare completamente questa implementazione. Puoi ignorare i valori predefiniti aggiungendo il tuo al file `terraform.tfvars`.

  La specifica di tutte le variabili disponibili si trova nel ***[registro](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** Terraform dei moduli

:::
* assicurati di aver impostato correttamente un'autenticazione aws cli eseguendo `aws s3 ls` - non dovrebbero esserci errori
* implementa l'infrastruttura `terraform apply`

### Passi post-implementazione {#post-deployment-steps}
* una volta terminata l'implementazione, prendi nota del `json_rpc_dns_name` valore variabile  stampato nel cli
* crea un record cname dns pubblico che punta il tuo nome di dominio al valore `json_rpc_dns_name` fornito. Ad esempio:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* una volta che il record cname si è propagato, controlla se la catena funziona correttamente chiamando il tuo endpoint JSON-PRC.   
  Dall'esempio sopra:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Procedura di distruzione {#destroy-procedure}
:::warning

La seguente procedura eliminerà in modo permanente l'intera infrastruttura implementata con questi script terraform.    
Assicurati di avere [backup di dati blockchain](docs/edge/working-with-node/backup-restore) corretti e/o di lavorare con un ambiente di test.

:::

Se è necessario rimuovere l'intera infrastruttura, esegui il seguente comando `terraform destroy`.   
Inoltre, dovrai rimuovere manualmente i segreti memorizzati in AWS [Parameter Store](https://aws.amazon.com/systems-manager/features/)
per la regione dove è avvenuta l'implementazione.
