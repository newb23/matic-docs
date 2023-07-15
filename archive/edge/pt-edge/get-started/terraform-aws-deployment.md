---
id: terraform-aws-deployment
title: Implantação do Terraform na AWS
description: "Implante a rede Polygon Edge no fornecedor de serviços na nuvem AWS utilizando o Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Guia de implantação de produção

Este é o guia de implantação na AWS oficial, pronto para produção e totalmente automatizado.

A implantação manual na ***[Nuvem](set-up-ibft-on-the-cloud)*** ou ***[Local](set-up-ibft-locally)***
é recomendada para testes e/ou se o seu fornecedor de serviços na nuvem não for a AWS.

:::

:::info

Esta implantação destina-se apenas a PoA.   
Se necessitar do mecanismo PoS, basta seguir este ***[guia](/docs/edge/consensus/migration-to-pos)*** para mudar de PoA para PoS.

:::

Este guia descreverá, em detalhe, o processo de implantação de uma rede blockchain Polygon Edge no fornecedor de serviços na nuvem AWS,
que está pronto para produção, uma vez que os nós de validadores estão espalhados por múltiplas zonas de disponibilidade.

## Pré-requisitos {#prerequisites}

### Ferramentas do sistema {#system-tools}
* [terraform](https://www.terraform.io/)
* [cli aws](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [ID da chave de acesso e chave de acesso secreto aws](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Variáveis Terraform {#terraform-variables}
Duas variáveis que devem ser fornecidas, antes de executar a implantação:

* `alb_ssl_certificate` - ARN do certificado do AWS Certificate Manager a ser usado pelo ALB para o protocolo https.   
  O certificado deve ser gerado antes de iniciar a implantação e tem de estar no estado **Issued**
* `premine` - conta que receberá a moeda nativa previamente minerada.
O valor deve seguir a especificação oficial do flag [CLI](/docs/edge/get-started/cli-commands#genesis-flags)

## informações sobre implantação {#deployment-information}
### Recursos implantados {#deployed-resources}
Visão geral de alto nível dos recursos que serão implantados:

* VPC dedicado
* 4 nós de validadores (que também são bootnodes)
* 4 gateways NAT para permitir o tráfego da internet de saída dos nós
* função Lambda usada para gerar o primeiro bloco (génese) e iniciar a chain
* Grupos de segurança dedicados e funções IAM
* Bucket S3 usado para armazenar o ficheiro genesis.json
* Application Load Balancer usado para expor o endpoint JSON-RPC

### Tolerância à falha {#fault-tolerance}

Para esta implantação são necessárias apenas regiões que tenham 4 zonas de disponibilidade. Cada nó é implantado numa única AZ.

Ao colocar cada nó numa única AZ, todo o cluster da blockchain se torna tolerante a falhas de um único nó (AZ), uma vez que o Polygon Edge implementa o
consenso IBFT, que permite que um único nó falhe num cluster de 4 nós de validador.

### Acesso às linhas de comandos {#command-line-access}

Os nós de validador não são expostos de forma alguma à internet pública (o JSON-PRC é acedido apenas via ALB)
e nem sequer têm endereços IP públicos ligados a si.  
O acesso às linhas de comandos dos nós só é possível através do [Gestor do Sistema AWS - Gestor de Sessões](https://aws.amazon.com/systems-manager/features/).

### Atualização do AMI base {#base-ami-upgrade}

Esta implantação usa o `ubuntu-focal-20.04-amd64-server` AWS AMI. **Não** desencadeará o *redeployment* do EC2 se o AWS AMI for atualizado.

Se, por algum motivo, o AMI base tiver de ser atualizado,
o mesmo pode ser alcançado executando o comando `terraform taint` para cada instância, antes de `terraform apply`.   
As instâncias podem ser "tainted" executando o comando     
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`

Exemplo:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

Num ambiente de produção, `terraform taint` deve ser executado um a um para manter a rede blockchain funcional.

:::

## Procedimento de implantação {#deployment-procedure}

### Passos pré-implantação {#pre-deployment-steps}
* leia na íntegra o readme do registo terraform [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)
* adicione o módulo `polygon-technology-edge` ao seu ficheiro `main.tf` usando as *provision instructions* da página readme dos módulos
* execute o comando `terraform init` para instalar todas as dependências Terraform necessárias
* forneça um novo certificado no [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* certifique-se de que o certificado fornecido está no estado **Issued** e anote o **ARN** do certificado
* configure a sua declaração de saída para obter a saída dos módulos na cli

#### `main.tf` exemplo {#example}
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

#### `terraform.tfvars` exemplo {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Etapas de implantação {#deployment-steps}
* crie o ficheiro `terraform.tfvars`
* defina as variáveis terraform necessárias neste ficheiro (como explicado acima).
:::info

Existem outras variáveis não obrigatórias que podem personalizar totalmente esta implantação.
Pode substituir os valores padrão adicionando os seus próprios ao ficheiro `terraform.tfvars`.

  A especificação de todas as variáveis disponíveis pode ser encontrada no ***[registo](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)** Terraform dos módulos*

:::
* certifique-se de que configurou corretamente uma autenticação de cli aws executando `aws s3 ls` - não devem ocorrer erros
* implante a infraestrutura `terraform apply`

### Passos pós-implantação {#post-deployment-steps}
* assim que a implantação estiver concluída, observe o valor da variável `json_rpc_dns_name` impresso na cli
* crie um registo dns cname público apontando o nome do seu domínio para o valor `json_rpc_dns_name` fornecido. Por exemplo:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* assim que o registo cname se propagar, verifique se a chain está a funcionar corretamente chamando o seu endpoint JSON-PRC.   
  Do exemplo acima:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Procedimento de destruição {#destroy-procedure}
:::warning

O procedimento seguinte eliminará permanentemente toda a infraestrutura implantada com estes scripts terraform.    
Certifique-se de que tem [backups dos dados da blockchain](docs/edge/working-with-node/backup-restore) adequados e/ou está a trabalhar com um ambiente de teste.

:::

Se precisar de remover toda a infraestrutura, execute o seguinte comando `terraform destroy`.   
Além disso, precisará de remover manualmente os segredos armazenados na AWS [Parameter Store](https://aws.amazon.com/systems-manager/features/)
para a região onde decorreu a implantação.
