---
id: terraform-aws-deployment
title: Terraform AWS স্থাপনা
description: "Terraform ব্যবহার করে AWS ক্লাউড প্রদানকারীর Polygon Edge নেটওয়ার্ক"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info উৎপাদন স্থাপনা গাইড
এটি অফিস, উত্পাদন প্রস্তুত, সম্পূর্ণরূপে অটোমেটেড, AWS স্থাপনা গাইড।

***[ক্লাউড](set-up-ibft-locally)*** ***[বা স্থানীয়](set-up-ibft-on-the-cloud)*** আপনার ক্লাউড প্রদানকারী AWS না থাকলে পরীক্ষার জন্য সুপারিশ করা হয়।
:::

:::info
   এই স্থাপনা শুধুমাত্র PoA যদি PoS প্রক্রিয়া প্রয়োজন হয়, তাহলে এখন এই ***[গাইড](/docs/edge/consensus/migration-to-pos)*** PoA থেকে PoS একটি সুইচ করতে
:::

এই গাইড বিস্তারিত, AWS ক্লাউড প্রদানকারীর একটি Polygon Edge blockchain নেটওয়ার্ক স্থাপনা প্রক্রিয়া বর্ণনা যে উত্পাদন প্রস্তুত হিসাবে যাচাইকারী নোড একাধিক প্রাপ্যতা জোন জুড়ে spanned করা হয়।

## পূর্বশর্ত {#prerequisites}

### সিস্টেম সরঞ্জাম {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [aws অ্যাক্সেস কী আইডি এবং গোপন অ্যাক্সেস কী](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Terraform ভেরিয়েবল {#terraform-variables}
deployment: চালানোর আগে দুটি ভেরিয়েবল প্রদান করা আবশ্যক:

* `alb_ssl_certificate`- AWS সার্টিফিকেট ম্যানেজার থেকে সার্টিফিকেট ARN HTTPS প্রোটোকল জন্য ALB দ্বারা ব্যবহার করা হবে   । সার্টিফিকেট স্থাপনা শুরু করার আগে তৈরি করা আবশ্যক, এবং এটি **জারি** অবস্থা
* `premine`- অ্যাকাউন্ট যে প্রাক mined নেটিভ মুদ্রা মান অফিসিয়াল [CLI](/docs/edge/get-started/cli-commands#genesis-flags) পতাকা স্পেসিফিকেশন

## স্থাপনা তথ্য {#deployment-information}
### ডিপ্লয়েড সম্পদ {#deployed-resources}
সম্পদ যে স্থাপনা করা হবে:

* উত্সর্গীকৃত VPC
* 4 যাচাইকারী নোড (যা বুট নোড
* 4 NAT গেটওয়ে নোড outbound ইন্টারনেট ট্রাফিক
* Lambda ফাংশন প্রথম (জেনেসিস) ব্লক তৈরি এবং চেইন
* উত্সর্গীকৃত নিরাপত্তা গ্রুপ এবং IAM ভূমিকা
* S3 বালতি genesis.json ফাইল
* অ্যাপ্লিকেশন লোড Balancer JSON-RPC এন্ডপয়েন্ট এক্সপোজ জন্য

### ফল্ট সহনশীলতা {#fault-tolerance}

শুধুমাত্র অঞ্চলে যে 4 প্রাপ্যতা অঞ্চল আছে এই স্থাপনা প্রতিটি নোড একটি এককে স্থাপন করা হয়।

একটি এককে প্রতিটি নোড স্থাপন করে, পুরো ব্লকচেইন ক্লাস্টার একটি একক নোড (AZ) ব্যর্থতা জন্য fault-tolerant ঐক্যমত্য যা একটি একক নোড একটি 4 যাচাইকারী নোড ক্লাস্টার ব্যর্থ করতে

### কমান্ড লাইন অ্যাক্সেস {#command-line-access}

ভ্যালিডেটর নোড পাবলিক ইন্টারনেট যে কোন ভাবেই উন্মুক্ত করা হয় না এবং তারা তাদের সাথে সংযুক্ত পাবলিক আইপি   ঠিকানা নেই। নোড কমান্ড লাইন অ্যাক্সেস শুধুমাত্র [AWS সিস্টেম ম্যানেজার মাধ্যমে সম্ভব](https://aws.amazon.com/systems-manager/features/)

### বেস AMI আপগ্রেড {#base-ami-upgrade}

এই স্থাপনা `ubuntu-focal-20.04-amd64-server`AWS AMI AWS AMI আপডেট করা হলে এটি EC2 **not** ট্রিগার *করবে*

যদি, কিছু কারণে, বেস AMI আপডেট পেতে প্রয়োজন এটি প্রতিটি উদাহরণ `terraform apply`   জন্য  `terraform taint`কমান্ড চলমান দ্বারা অর্জন করা যেতে ইন্সট্যান্স     চলমান দ্বারা টেইন্টেড`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance` কমান্ড।

উদাহরণ:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info
একটি উত্পাদন পরিবেশে `terraform taint`ব্লকচেইন নেটওয়ার্ক কার্যকরী
:::

## স্থাপনা পদ্ধতি {#deployment-procedure}

### প্রাক স্থাপনা পদক্ষেপ {#pre-deployment-steps}
* [Polygon-technology](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)-edge terraform রেজিস্ট্রি readme
* মডিউল modules' পৃষ্ঠায় বিধান নির্দেশাবলী *ব্যবহার* `polygon-technology-edge``main.tf`করে
* `terraform init`সমস্ত প্রয়োজনীয় Terraform নির্ভরতা
* AWS সার্টিফিকেট [ম্যানেজার](https://aws.amazon.com/certificate-manager/)
* নিশ্চিত করুন যে **প্রদত্ত** সার্টিফিকেট **জারি** অবস্থায়
* cli মডিউল 'আউটপুট পেতে

#### `main.tf`উদাহরণ {#example}
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

#### `terraform.tfvars`উদাহরণ {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### স্থাপনা পদক্ষেপ {#deployment-steps}
* `terraform.tfvars`ফাইল
* এই ফাইলের প্রয়োজনীয় terraform ভেরিয়েবল সেট করুন:::info
অন্যান্য অ বাধ্যতামূলক ভেরিয়েবল যে সম্পূর্ণরূপে এই স্থাপনা কাস্টমাইজ করতে আপনি আপনার নিজের ফাইল `terraform.tfvars`যোগ করে ডিফল্ট মান

সমস্ত উপলব্ধ ভেরিয়েবল স্পেসিফিকেশন মডিউল 'Terraform ***[রেজিস্ট্রি](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)***
:::
* নিশ্চিত করুন যে আপনি একটি aws `aws s3 ls`cli
* পরিকাঠামো`terraform apply`

### পোস্ট স্থাপনা পদক্ষেপ {#post-deployment-steps}
* একবার স্থাপনা সমাপ্ত হয়, cli `json_rpc_dns_name`মুদ্রিত
* একটি পাবলিক dns cname রেকর্ড উপলব্ধ `json_rpc_dns_name`মান আপনার ডোমেন নাম উদাহরণস্বরূপ:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* একবার cname রেকর্ড প্রচার করে, চেক করুন যে চেইন আপনার JSON-PRC এন্ডপয়েন্ট কল করে সঠিকভাবে কাজ করছে   । উপরে উদাহরণ
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## ধ্বংস পদ্ধতি {#destroy-procedure}
:::warning
নিম্নলিখিত পদ্ধতি স্থায়ীভাবে এই     terraform স্ক্রিপ্ট সঙ্গে আপনার সম্পূর্ণ পরিকাঠামো স্থাপনা মুছে ফেলবে। নিশ্চিত [করুন যে আপনার সঠিক ব্লকচেইন ডেটা ব্যাকআপ](docs/edge/working-with-node/backup-restore) এবং / বা আপনি একটি টেস্টিং পরিবেশ সঙ্গে কাজ করছেন।
:::

আপনি যদি পুরো পরিকাঠামো অপসারণ করতে হবে`terraform destroy`   , নিম্নলিখিত কমান্ড উপরন্তু, আপনি নিজে AWS [পরামিতি দোকান সংরক্ষণ](https://aws.amazon.com/systems-manager/features/) গোপন অপসারণ অঞ্চলের জন্য স্থাপনা স্থান
