---
id: terraform-aws-deployment
title: Penyebaran Terraform AWS
description: "Menyebarkan jaringan Polygon Edge di penyedia cloud AWS menggunakan Terraform"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info Panduan penyebaran produksi

Ini adalah panduan resmi untuk penyebaran AWS yang siap digunakan, dan sepenuhnya otomatis.

Penyebaran manual ke ***[Cloud](set-up-ibft-on-the-cloud)*** atau ***[Lokal](set-up-ibft-locally)***
direkomendasikan untuk pengujian dan/atau jika penyedia cloud Anda bukan AWS.

:::

:::info

Penyebaran ini khusus PoA.   
Jika mekanisme PoS diperlukan, ikuti ***[panduan](/docs/edge/consensus/migration-to-pos)*** ini sekarang untuk beralih dari PoA ke PoS.

:::

Panduan ini akan menjelaskan secara detail proses penyebaran jaringan blockchain Polygon Edge di penyedia cloud AWS
yang siap produksi karena node validatornya membentang di berbagai zona ketersediaan.

## Prasyarat {#prerequisites}

### Alat sistem {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [ID kunci akses dan kunci akses rahasia aws](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Variabel Terraform {#terraform-variables}
Dua variabel yang harus disediakan, sebelum menjalankan tugas:

* `alb_ssl_certificate` - ARN sertifikat dari AWS Certificate Manager yang akan digunakan oleh ALB untuk protokol http.   
   Sertifikat tersebut harus dihasilkan sebelum memulai penyebaran dan harus memiliki status **Diterbitkan**
* `premine` - akun yang akan menerima mata uang asli pratambang.
Nilai harus mengikuti spesifikasi bendera [CLI](/docs/edge/get-started/cli-commands#genesis-flags) resmi

## Informasi penyebaran {#deployment-information}
### Sumber daya yang disebarkan {#deployed-resources}
Ikhtisar tingkat tinggi tentang sumber daya yang akan disebarkan:

* VPC Khusus
* 4 node validator (yang juga merupakan bootnode)
* 4 NAT gateway untuk memungkinkan lalu lintas internet keluar node
* Fungsi Lambda untuk menghasilkan blok (genesis) pertama dan memulai rantai
* Grup keamanan khusus dan peran IAM
* Bucket S3 untuk menyimpan file genesis.json
* Penyeimbang Beban Aplikasi yang digunakan untuk mengekspos titik akhir JSON-RPC

### Toleransi pelanggaran {#fault-tolerance}

Hanya wilayah yang memiliki 4 zona ketersediaan yang diperlukan untuk penyebaran ini. Setiap node disebarkan dalam AZ tunggal.

Dengan menempatkan setiap node dalam AZ tunggal, seluruh klaster blockchain bersifat toleran-pelanggaran terhadap kegagalan node tunggal (AZ), karena Polygon Edge menerapkan konsensus IBFT
yang memungkinkan node tunggal gagal dalam klaster 4 node validator.

### Akses baris perintah {#command-line-access}

Node validator tidak diekspos dengan cara apa pun ke internet publik (JSON-PRC diakses hanya melalui ALB)
dan bahkan tidak memiliki alamat IP publik yang dilampirkan padanya.  
Akses baris perintah node mungkin digunakan hanya melalui [AWS Systems Manager - Session Manager](https://aws.amazon.com/systems-manager/features/).

### Peningkatan AMI dasar {#base-ami-upgrade}

Penyebaran ini menggunakan AWS AMI`ubuntu-focal-20.04-amd64-server`. Ini **tidak** akan memicu *penyebaran ulang* EC2 jika AWS AMI mendapat pembaruan.

Jika, karena alasan tertentu, AMI dasar diwajibkan untuk mendapatkan pembaruan,
hal ini dapat dilakukan dengan menjalankan perintah `terraform taint` untuk setiap instans, sebelum `terraform apply`.   
Instans dapat dikontaminasi dengan menjalankan perintah     .
`terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`

Contoh:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

Dalam lingkungan produksi, `terraform taint` harus dijalankan satu persatu untuk agar jaringan blockchain tetap berfungsi.
:::

## Prosedur penyebaran {#deployment-procedure}

### Langkah prapenyebaran {#pre-deployment-steps}
* baca readme registri terraform [polygon-technology-edge](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) dengan cermat
* tambahkan modul `polygon-technology-edge` ke file `main.tf` menggunakan *instruksi penyediaan* pada halaman readme modul
* jalankan perintah `terraform init` untuk menginstal semua dependensi Terraform yang diperlukan
* berikan sertifikat baru dalam [AWS Certificate Manager](https://aws.amazon.com/certificate-manager/)
* pastikan sertifikat yang disediakan berada dalam status **Diterbitkan** dan catat **ARN** sertifikat tersebut
* atur pernyataan keluaran untuk mendapatkan keluaran modul dalam cli

#### contoh `main.tf` {#example}
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

#### contoh `terraform.tfvars` {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### Langkah-langkah penyebaran {#deployment-steps}
* buat file `terraform.tfvars`
* atur variabel terraform yang diperlukan dalam file ini (seperti dijelaskan di atas).
:::info

Ada variabel tidak wajib lainnya yang dapat sepenuhnya menyesuaikan penyebaran ini.
Anda dapat menimpa nilai default dengan menambahkan nilai ke file `terraform.tfvars`.

  Spesifikasi semua variabel yang tersedia dapat dilihat dalam modul ***[registri](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** Terraform.

:::
* pastikan telah menyiapkan autentikasi aws cli secara tepat dengan menjalanka  `aws s3 ls` - tidak boleh ada kesalahan
* sebarkan infrastruktur `terraform apply`

### Langkah-langkah pascapenyebaran {#post-deployment-steps}
* setelah penyebaran selesai, catat nilai variabel `json_rpc_dns_name` yang dicetak dalam cli
* buat rekaman cname dns publik yang menunjuk nama domain ke nilai `json_rpc_dns_name` yang diberikan. Misalnya:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* setelah rekaman cname menyebar, periksa apakah rantai bekerja secara tepat dengan memanggil titik akhir JSON-PRC.   
  Dari contoh di atas:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## Prosedur penghancuran {#destroy-procedure}
:::warning

Prosedur berikut akan secara menghapus secara permanen seluruh infrastruktur yang disebarkan dengan skrip terraform ini.    
Pastikan ada [cadangan data blockchain](docs/edge/working-with-node/backup-restore) yang tepat dan/atau yang digunakan dalam lingkungan pengujian.

:::

Jika perlu menghapus seluruh infrastruktur, jalankan perintah berikut `terraform destroy`.   
Selain itu, Anda harus menghapus secara manual rahasia yang disimpan dalam AWS [Parameter Store](https://aws.amazon.com/systems-manager/features/)
untuk wilayah lokasi penyebaran.
