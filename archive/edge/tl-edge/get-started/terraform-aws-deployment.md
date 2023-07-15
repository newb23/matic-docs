---
id: terraform-aws-deployment
title: Pag-deploy ng Terraform AWS
description: "I-deploy ang Polygon Edge network sa AWS cloud provider gamit ang Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Gabay sa pag-deploy ng produksyon

Ito ang opisyal, handa na sa produksyon, ganap na automated, na gabay sa deployment ng AWS.

Ang mga manual na pag-deploy sa ***[Cloud](set-up-ibft-on-the-cloud)*** o ***[Lokal](set-up-ibft-locally)***
ay inirerekomenda para sa pagsubok at/o kung ang iyong cloud provider ay hindi AWS.

:::

:::info

Ang pag-deploy na ito ay PoA lamang.   
Kung kinakailangan ang PoS mechanism, sundin lamang ang ***[gabay](/docs/edge/consensus/migration-to-pos)*** na ito kung paano gawin ang paglipat mula PoA patungong PoS.

:::

Detalyadong ilalarawan ng gabay na ito ang proseso ng pag-deploy ng isang Polygon Edge blockchain network sa AWS cloud provider,
na handa na sa produksyon habang ang mga validator node ay nakakalat sa maraming mga availability zone.

## Mga Paunang Kinakailangan {#prerequisites}

### Mga system tool {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [aws access key ID at secret access key](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Mga Terraform variable {#terraform-variables}
Dalawang variable na dapat ibigay, bago patakbuhin ang deployment:

* `alb_ssl_certificate`- ang ARN ng sertipiko mula sa AWS Certificate Manager na gagamitin ng ALB para sa https protocol.      Ang sertipiko ay dapat na mabuo bago simulan ang pag-deploy, at dapat mayroon itong **Inilabas** na status
* `premine` - ang account na makakatanggap ng pre-mined na native currency.
Dapat sundin ng value ang opisyal na [CLI](/docs/edge/get-started/cli-commands#genesis-flags) flag specification

## Impormasyon sa pag-deploy {#deployment-information}
### Mga na-deploy na resources {#deployed-resources}
High level na pangkalahatang-ideya ng mga resources na ide-deploy:

* Dedicated VPC
* 4 na mga validator node (na mga boot node rin)
* 4 na mga NAT gateway para pahintulutan ang mga node outbound internet traffic
* Ang Lambda function na ginamit para sa pagbuo ng unang (genesis) block at simulan ang chain
* Mga dedicated security group at mga tungkulin ng IAM
* Ang S3 bucket na gamit para sa pag-imbak ng genesis.json file
* Ang Application Load Balancer na gamit para sa paglalantad sa JSON-RPC endpoint

### Fault tolerance {#fault-tolerance}

Ang mga region lamang na may 4 na availability zone ang kinakailangan para sa pag-deploy na ito. Ang bawat node ay na-deploy sa nag-iisang AZ.

Sa pamamagitan ng paglalagay ng bawat node sa nag-iisang AZ, ang buong blockchain cluster ay fault-tolerant sa nag-iisang node (AZ) failure, habang ipinapatupad ng Polygon Edge ang IBFT
consensus na nagpapahintulot sa nag-iisang node na papalya sa 4 na validator node cluster.

### Command line access {#command-line-access}

Ang mga validator node ay hindi nakalantad sa anumang paraan sa pampublikong internet (ang JSON-PRC ay maa-access lamang sa pamamagitan ng ALB)
at walang naka-attach na pampublikong IP address sa kanila.  
Ang node command line access ay posible lamang sa pamamagitan ng [AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/).

### Base AMI upgrade {#base-ami-upgrade}

Ang pag-deploy na ito ay gumagamit ng `ubuntu-focal-20.04-amd64-server` AWS AMI. **Hindi** ito magti-trigger ng EC2 *redeployment* kung ang AWS AMI ay naka-update.

Kung sa ilang kadahilanan ay kinakailangang i-update ang base AMI,
maaari itong makamit sa pamamagitan ng pagpapatakbo ng `terraform taint`command ng para sa bawat instance, bago ang `terraform apply`.   
Ang mga instance ay maaaring mabahiran sa pamamagitan ng pagpapatakbo ng    
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance` na command.

Halimbawa:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

Sa isang kapaligirang pamproduksyon ang `terraform taint` ay dapat patakbuhin nang isa-isa para mapanatiling gumagana ang blockchain network.

:::

## Pamamaraan sa pag-deploy {#deployment-procedure}

### Mga hakbang bago ang pag-deploy {#pre-deployment-steps}
* basahin ang [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) terraform registry readme
* idagdag ang `polygon-technology-edge` module sa iyong `main.tf` file na gamit ang mga *probisyong tagubilin* sa readme page ng module
* patakbuhin ang `terraform init` command upang i-install ang kinakailangang mga Terraform dependency
* magbigay ng bagong sertipiko sa [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* tiyaking ang ibinigay na sertipiko ay nasa **Issued** na state at kunin ang note ng **ARN** ng sertipiko
* i-set up ang iyong output statement para makuha ang output ng mga module sa cli

#### `main.tf` halimbawa {#example}
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

#### `terraform.tfvars` halimbawa {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Mga hakbang sa pag-deploy {#deployment-steps}
* likhain ang `terraform.tfvars` file
* itakda ang mga kinakailangang terraform variable sa file na ito (gaya ng ipinaliwanag sa itaas).
:::info

May mga iba pang mga non-mandatory variable na maaaring ganap na ma-customize ang pag-deploy na ito.
Maaari mong i-override ang mga default na value sa pamamagitan ng pagdadagdag ng sarili mo sa `terraform.tfvars` file.

  Ang specification para sa lahat ng mga available na variable ay matatagpuan Terraform ***[registry](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** ng mga module

:::
* tiyaking nag-set up ka ng aws cli authentication nang maayos sa pamamagitan ng pagpapatakbo ng `aws s3 ls` - dapat walang mga error
* i-deploy ang imprastraktura `terraform apply`

### Mga hakbang pagkatapos ng pag-deploy {#post-deployment-steps}
* kapag tapos na ang pag-deploy, tandaan ang `json_rpc_dns_name` variable value na nakaimprenta sa cli
* gumawa ng isang pampublikong dns cname record na nagtuturo sa iyong domain name sa ibinigay na `json_rpc_dns_name` value. Halimbawa:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* kapag lumaganap ang cname record, tingnan kung gumagana nang maayos ang chain sa pamamagitan ng pagtawag sa iyong JSON-PRC endpoint.   
  Mula sa halimbawa sa itaas:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Pamamaraan ng pagsira {#destroy-procedure}
:::warning

Ang sumusunod na pamamaraan ay permanenteng magtatanggal sa iyong buong imprastrukturang na-deploy sa mga terraform script na ito.    
Tiyaking mayroon kang maayos na [blockchain data backup](docs/edge/working-with-node/backup-restore) at/o gumagawa ka sa isang testing environment.

:::

Kung kailangan mong alisin ang buong imprastraktura, patakbuhin ang sumusunod na command `terraform destroy`.   
Bukod pa rito, kakailanganin mong manual na alisin ang mga secret na naka-imbak sa AWS [Parameter Store](https://aws.amazon.com/systems-manager/features/)
para sa region kung saan naganap ang pag-deploy.
