---
id: terraform-aws-deployment
title: การปรับใช้ Terraform AWS
description: "ปรับใช้เครือข่าย Polygon Edge กับผู้ให้บริการคลาวด์ AWS โดยใช้ Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info คู่มือเกี่ยวกับการปรับใช้ผลิตภัณฑ์

คำแนะนำนี้เป็นคำแนะนำเกี่ยวกับการปรับใช้ AWS แบบอัตโนมัติเต็มรูปแบบที่พร้อมสำหรับการใช้งานจริงอย่างทางการ

แนะนำการปรับใช้งานด้วยตนเองกับ***[คลาวด์](set-up-ibft-on-the-cloud)***หรือ***[ภายใน](set-up-ibft-locally)***สำหรับการทดสอบและ/หรือในกรณีที่ผู้ให้บริการคลาวด์ของคุณไม่ใช่ AWS
:::

:::info

การปรับใช้งานนี้เป็นแบบ PoA เท่านั้น    
หากจำเป็นต้องใช้กลไก PoS ก็เพียงแค่ทำตามวิธีการย้ายจาก PoA ไปยัง PoS ใน***[คู่มือ](/docs/edge/consensus/migration-to-pos)***ฉบับนี้
:::

คู่มือนี้จะอธิบายกระบวนการปรับใช้เครือข่ายบล็อกเชน Polygon Edge กับผู้ให้บริการคลาวด์ AWS โดยละเอียด
ซึ่งพร้อมสำหรับการใช้งานจริงเมื่อขยายโหนดตัวตรวจสอบความถูกต้องออกไปใน Availability Zone จำนวนมาก

## ข้อกำหนดเบื้องต้น {#prerequisites}

### เครื่องมือของระบบ {#system-tools}
* [Terraform](https://www.terraform.io/)
* [AWS cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [ID ของคีย์การเข้าใช้งาน AWS และคีย์การเข้าใช้งานข้อมูลลับ](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### ตัวแปรของ Terraform {#terraform-variables}
ตัวแปรที่ต้องให้สองตัวที่กำหนด ก่อนที่จะเรียกใช้การใช้งาน:

* `alb_ssl_certificate` - ARN ของใบรับรองจาก AWS Certificate Manager ซึ่ง ALB จะใช้สำหรับโปรโตคอล https    
  ให้สร้างใบรับรองก่อนเริ่มการปรับใช้งาน และใบรับรองต้องมีสถานะ**ออกให้แล้ว**
* `premine` - บัญชีที่จะรับสกุลเงินดั้งเดิมที่วางไว้ล่วงหน้า
ค่าต้องเป็นไปตามข้อมูลค่าสถานะ [CLI](/docs/edge/get-started/cli-commands#genesis-flags) อย่างเป็นทางการ

## ข้อมูลเกี่ยวกับการปรับใช้ {#deployment-information}
### ทรัพยากรที่ปรับใช้ {#deployed-resources}
ภาพรวมระดับสูงของทรัพยากรที่จะปรับใช้:

* VPC แบบเฉพาะ
* โหนดตัวตรวจสอบความถูกต้องจำนวน 4 โหนด (ซึ่งเป็นบูตโหนดในขณะเดียวกัน)
* เกตเวย์ NAT จำนวน 4 รายการ ซึ่งอนุญาตการใช้งานอินเตอร์เน็ตภายนอกให้กับโหนด
* ฟังก์ชัน Lambda ซึ่งใช้สำหรับสร้างบล็อกแรก (บล็อก Genesis) และเริ่มต้นเชน
* บทบาท IAM และกลุ่มความปลอดภัยแบบเฉพาะ
* S3 Bucket ที่ใช้เพื่อจัดเก็บไฟล์ genesis.json
* Application Load Balancer ที่ใช้ในการแสดง JSON-RPC Endpoint

### ความทนทานต่อความผิดพลาด {#fault-tolerance}

สำหรับการปรับใช้นี้ ให้ใช้เฉพาะ Region ที่มี Availability Zone จำนวน 4 โซนปรับใช้งานแต่ละโหนดใน AZ เดียว

โดยการวางโหนดแต่ละโหนดใน AZ เดี่ยว คลัสเตอร์ของบล็อกเชนทั้งหมดจะมีความทนทานต่อความผิดพลาดกับการขัดข้องในโหนดเดี่ยว (AZ) เมื่อ Polygon Edge ปรับใช้ฉันทามติ IBFT
ซึ่งยอมให้โหนดขัดข้องได้ 1 โหนด ในคลัสเตอร์โหนดตัวตรวจสอบความถูกต้องแบบ 4 โหนด

### การเข้าถึงบรรทัดคำสั่ง {#command-line-access}

ไม่มีการแสดงโหนดตัวตรวจสอบความถูกต้องต่อเครือข่ายอินเทอร์เน็ตสาธารณะแต่อย่างใด (เข้าใช้งาน JSON-PRC ผ่าน ALB เท่านั้น)
และบรรดาโหนดนั้นไม่มี IP สาธารณะแนบท้ายด้วย   
บรรทัดคำสั่งโหนดสามารถเข้าถึงได้เฉพาะผ่าน [AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/)

### การอัปเกรด Base AMI {#base-ami-upgrade}

การปรับใช้นี้ใช้ `ubuntu-focal-20.04-amd64-server` AWS AMIโดย**ไม่มี**การทริกเกอร์*การปรับใช้ใหม่*กับ EC2 หากมีการอัปเดต AWS AMI

หากจำเป็นต้องอัปเดต Base AMI ด้วยเหตุผลบางอย่างจะสามารถทำได้โดยเรียกใช้คำสั่ง `terraform taint` สำหรับอินสแตนซ์แต่ละรายการ ก่อน `terraform apply`    
คุณสามารถดำเนินการกับอินสแตนซ์ได้โดยเรียกใช้คำสั่ง     
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`

ตัวอย่าง:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

ในสภาพแวดล้อมการใช้งานจริง ควรเรียกใช้ `terraform taint` ทีละรายการเพื่อรักษาการทำงานของเครือข่ายบล็อกเชน

:::

## ขั้นตอนการปรับใช้ {#deployment-procedure}

### ขั้นตอนที่ต้องดำเนินการก่อนการปรับใช้ {#pre-deployment-steps}
* อ่านไฟล์ Readme ของ Terraform Registry [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)
* เพิ่มโมดูล `polygon-technology-edge` ลงในไฟล์ `main.tf` ของคุณโดยใช้*คำแนะนำเกี่ยวกับข้อกำหนด*ในหน้า Readme ของโมดูล
* เรียกใช้คำสั่ง `terraform init` เพื่อติดตั้งรูปแบบการขึ้นต่อกันของ Terraform ที่จำเป็นทั้งหมด
* จัดเตรียมใบรับรองใหม่ใน [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* ตรวจสอบว่าใบรับรองที่ให้ไว้อยู่ในสถานะ **ออกให้แล้ว** และบันทึก **ARN** ของใบรับรองไว้
* ตั้งค่าชุดคำสั่งเอาต์พุตของคุณ เพื่อให้ได้ค่าเอาต์พุตของโมดูลใน cli

#### ตัวอย่าง `main.tf` {#example}
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

#### ตัวอย่าง `terraform.tfvars` {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### ขั้นตอนการปรับใช้ {#deployment-steps}
* สร้างไฟล์ `terraform.tfvars`
* กำหนดตัวแปรของ terraform ที่จำเป็นต้องใช้กับไฟล์นี้ (ตามที่อธิบายไว้ด้านบน)
:::info

มีตัวแปรที่ไม่จำเป็นอื่นๆ ที่สามารถปรับเปลี่ยนการปรับใช้นี้ได้อย่างเต็มรูปแบบ
คุณสามารถแทนที่ค่าเริ่มต้นได้โดยการเพิ่มค่าของตัวคุณเองในไฟล์ `terraform.tfvars`

  ค้นหาข้อมูลจำเพาะของตัวแปรที่มีอยู่ทั้งหมดได้ใน***[รีจิสทรี](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** Terraform ของโมดูลต่างๆ

:::
* ทำให้มั่นใว่าคุณได้กำหนดค่าการรับรองความถูกต้อง aws cli อย่างถูกต้องโดยเรียกใช้ `aws s3 ls` - ต้องไม่ปรากฏข้อผิดพลาด
* ปรับใช้โครงสร้างพื้นฐาน `terraform apply`

### ขั้นตอนที่ต้องดำเนินการหลังการปรับใช้ {#post-deployment-steps}
* เมื่อเสร็จสิ้นการปรับใช้แล้ว ให้บันทึกค่าตัวแปร `json_rpc_dns_name` ที่พิมพ์ไว้ใน cli
* สร้างบันทึก dns cname สาธารณะ ซึ่งระบุชื่อโดเมนของคุณแก่ค่า `json_rpc_dns_name` ที่กำหนดไว้ตัวอย่าง:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* เมื่อบันทึก cname เผยแพร่ ให้ตรวจสอบว่าเชนทำงานอย่างถูกต้องหรือไม่ โดยเรียกใช้ JSON-PRC Endpoint ของคุณ    
  จากตัวอย่างด้านบน:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## ขั้นตอนการทำลาย {#destroy-procedure}
:::warning
กระบวนการต่อไปนี้จะลบโครงสร้างพื้นฐานทั้งหมดของคุณที่ปรับใช้ด้วยการใช้สคริปต์ terraform เหล่านี้อย่างถาวร    ตรวจสอบให้แน่ใจว่าคุณมี[ข้อมูลสำรองของข้อมูลบล็อกเชน](docs/edge/working-with-node/backup-restore) และ/หรือคุณกำลังดำเนินการในสภาพแวดล้อมทดสอบ

:::

หากคุณจำเป็นต้องลบโครงสร้างพื้นฐานทั้งหมด ให้เรียกใช้คำสั่งดังต่อไปนี้ `terraform destroy`   
นอกจากนี้ คุณต้องลบข้อมูลลับที่เก็บไว้ใน AWS [Parameter Store](https://aws.amazon.com/systems-manager/features/) ด้วยตนเอง
สำหรับ Region ที่ได้ดำเนินการปรับใช้
