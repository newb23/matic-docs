---
id: terraform-aws-deployment
title: Terraform AWS डिप्लॉयमेंट
description: "Terraform का इस्तेमाल करके AWS प्रोवाइडर पर पॉलीगॉन एज नेटवर्क डिप्लॉय करें"
keywords:
  - docs
  - polygon
  - edge
  - deployment
  - terraform
  - aws
  - script
---
:::info उत्पादन डिप्लॉयमेंट गाइड

यह आधिकारिक है, प्रोडक्शन के लिए तैयार है, पूरी तरह से स्वचालित एक AWS डिप्लॉयमेंट गाइड है.

***[क्लाउड](set-up-ibft-on-the-cloud)*** या ***[स्थानीय](set-up-ibft-locally)*** पर मैनुअल डिप्लॉयमेंट
का सुझाव दिया जाता है ताकि प्रोवाइडर AWS ना होने पर टेस्टिंग की जा सके.

:::

:::info

यह डिप्लॉयमेंट सिर्फ़ POA है.    
अगर PoS मैकेनिज्म की ज़रूरत है, तो PoA से PoS पर स्विच करने के लिए अभी इस ***[गाइड](/docs/edge/consensus/migration-to-pos)*** का पालन करें.
:::

इस गाइड में विस्तार से AWS क्लाउड प्रोवाइडर पर पॉलीगॉन एज ब्लॉकचेन नेटवर्क डिप्लॉय करने की प्रक्रिया का वर्णन करेंगे,
जो कि उत्पादन के लिए तैयार है क्योंकि वैलिडेटर नोड्स कई उपलब्धता ज़ोन में फैले हुए हैं.

## आवश्यक शर्तें {#prerequisites}

### सिस्टम टूल {#system-tools}
* [terraform](https://www.terraform.io/)
* [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)
* [aws एक्सेस की ID और सीक्रेट एक्सेस की](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-prereqs.html#getting-started-prereqs-keys)

### Terraform वेरिएबल्स {#terraform-variables}
दो वेरिएबल जो डिवेलप को चलाने से पहले प्रदान किया जाना चाहिए:

* `alb_ssl_certificate` - https प्रोटोकॉल के लिए ALB द्वारा इस्तेमाल किए जाने वाले AWS प्रमाणपत्र मैनेजर के प्रमाणपत्र का ARN.      डिप्लॉयमेंट शुरू करने से पहले प्रमाणपत्र जनरेट किया जाना चाहिए और उसका स्टेटस **जारी** किया जाना चाहिए
* `premine`- वह अकाउंट जो premined नेटिव मुद्रा प्राप्त करेगा.
वैल्यू को आधिकारिक [CLI](/docs/edge/get-started/cli-commands#genesis-flags) फ़्लैग विनिर्देशों का पालन करना चाहिए

## डिप्लॉयमेंट की जानकारी {#deployment-information}
### डिप्लॉय किए गए संसाधन {#deployed-resources}
डिप्लॉय किए गए संसाधनों का हाई लेवल ओवरव्यू:

* डेडिकेटेड VPC
* 4 वेलिडेटर नोड्स (जो बूट नोड्स भी हैं)
* नोड्स आउटबाउंड इंटरनेट ट्रैफ़िक को अनुमति देने के लिए 4 NAT गेटवे
* Lambda फ़ंक्शन का इस्तेमाल पहले (जेनेसिस) ब्लॉक को जनरेट करने और सीरीज़ शुरू करने के लिए किया जाता है
* डेडिकेटेड सुरक्षा समूह और IAM भूमिकाएँ
* genesis.json फ़ाइल को स्टोर करने के लिए इस्तेमाल किया गया S3 बकेट
* एप्लिकेशन लोड बैलेंसर JSON-RPC एंडपॉइंट को खुलासा करने के लिए इस्तेमाल किया जाता है

### फॉल्ट टोलेरेंस {#fault-tolerance}

इस डिप्लॉयमेंट के लिए सिर्फ़ 4 उपलब्धता क्षेत्रों वाले ज़ोन की ज़रूरत होती है. हर नोड सिंगल AZ में डिप्लॉय किया जाता है.

हर नोड को एक सिंगल AZ में रखकर, पूरे ब्लॉकचैन क्लस्टर सिंगल नोड (AZ) विफलता के लिए फॉल्ट टोलेरेंस है, क्योंकि पॉलीगॉन एज IBFT सर्वसम्मति को लागू करता है
जो सिंगल नोड को 4 वैलिडेटर नोड क्लस्टर में विफल होने की अनुमति देता है.

### कमांड लाइन एक्सेस {#command-line-access}

वैलिडेटर नोड्स सार्वजनिक इंटरनेट के लिए किसी भी तरह से सार्वजनिक नहीं होते हैं (JSON-PRC को केवल ALB के माध्यम से एक्सेस किया जाता है)
और उनके पास सार्वजनिक IP पते भी नहीं होते हैं.   नोड कमांड लाइन का इस्तेमाल सिर्फ़ [AWS सिस्टम्स मैनेजर - सेशन मैनेजर](https://aws.amazon.com/systems-manager/features/) के माध्यम से संभव है.

### बेस AMI अपग्रेड {#base-ami-upgrade}

यह डिप्लॉयमेंट में `ubuntu-focal-20.04-amd64-server`AWS AMI का इस्तेमाल किया जाता है. अगर AWS AMI अपडेट हो जाता है तो यह *EC2 रिडिप्लॉयमेंट को* ट्रिगर **नहीं** करेगा.

अगर, किसी कारण से, बेस AMI को अपडेट करने की ज़रूरत है, ये प्रत्येक इंस्टैंस के लिए `terraform taint`कमांड रन करके प्राप्त किया जा सकता है `terraform apply`.    कमांड     `terraform taint module.instances[<instance_number>].aws_instance.polygon_edge_instance`चलाकर इंस्टैंस को टेंटेड
किया जा सकता है.

उदाहरण:
```shell
terraform taint module.instances[0].aws_instance.polygon_edge_instance
terraform taint module.instances[1].aws_instance.polygon_edge_instance
terraform taint module.instances[2].aws_instance.polygon_edge_instance
terraform taint module.instances[3].aws_instance.polygon_edge_instance
terraform apply
```

:::info

ब्लॉकचैन नेटवर्क को फ़ंक्शनल बनाए रखने के लिए एक उत्पादन क्षेत्र में `terraform taint`को एक-एक करके रन किया जाना चाहिए.
:::

## डिप्लॉयमेंट की प्रक्रिया {#deployment-procedure}

### प्रि डिप्लॉयमेंट स्टेप्स {#pre-deployment-steps}
* [पॉलीगॉन-टेक्नोलॉजी-एज](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws) terraform रजिस्ट्री रीडमी के माध्यम से पढ़ें
* मॉड्यूल के रीडमी पेज पर *प्रावधान के निर्देशों* का इस्तेेमाल करके मॉड्यूल `polygon-technology-edge` को अपनी `main.tf`फ़ाइल में जोड़ें
* सभी आवश्यक Terraform निर्भरताओं को इंस्टॉल करने के लिए `terraform init` कमांड चलाएँ
* [AWS प्रमाणपत्र मैनेजर](https://aws.amazon.com/certificate-manager/) में एक नया प्रमाणपत्र प्रदान करें
* यह सुनिश्चित करें कि प्रदान किया गया प्रमाणपत्र **जारी** है और प्रमाणपत्र के **ARN** पर भी ध्यान दें
* CLI में मॉड्यूल का आउटपुट प्राप्त करने के लिए अपना आउटपुट स्टेटमेंट सेट अप करें

#### `main.tf` उदाहरण {#example}
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

#### `terraform.tfvars` उदाहरण {#example-1}
```terraform
premine             = "0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"
alb_ssl_certificate = "arn:aws:acm:us-west-2:123456789:certificate/64c7f117-61f5-435e-878b-83186676a8af"
```

### डिप्लॉयमेंट के स्टेप्स {#deployment-steps}
* `terraform.tfvars` फ़ाइल बनाएँ
* इस फ़ाइल में आवश्यक terraform वैरिएबल्स सेट करें (जैसा कि ऊपर बताया गया है).
:::info

अन्य गैर-ज़रूरी वैरिएबल्स हैं जो इस डिप्लॉमेंट को पूरी तरह से कस्टमाइज़ कर सकते हैं. आप ख़ुद `terraform.tfvars` फ़ाइल में जोड़कर डिफ़ॉल्ट वैल्यू को ओवरराइड कर सकते हैं.

  सभी उपलब्ध वैरिेबल्स की विशिष्टता मॉड्यूल की Terraform ***[रजिस्ट्री](https://registry.terraform.io/modules/aws-ia/polygon-technology-edge/aws)*** में पाई जा सकती है

:::
* सुनिश्चित करें कि आपने `aws s3 ls` रन कराकर aws cli ऑथेंटिकेशन ठीक से सेट अप किया है - कोई गड़बड़ी नहीं होनी चाहिए
* इंफ्रास्ट्रक्चर डिप्लॉय करें `terraform apply`

### पोस्ट डिप्लॉयमेंट के स्टेप्स {#post-deployment-steps}
* एक बार डिप्लॉयमेंट पूरा हो जाने के बाद, cli में प्रिंटेड `json_rpc_dns_name` वेरिएबल वैल्यू को नोट करें
* एक सार्वजनिक dns cname रिकॉर्ड बनाएँ जो आपके डोमेन नाम को प्रदान किए गए `json_rpc_dns_name` वैल्यू की ओर पॉइंट करे. उदाहरण के लिए:
  ```shell
  # BIND syntax
  # NAME                            TTL       CLASS   TYPE      CANONICAL NAME
  rpc.my-awsome-blockchain.com.               IN      CNAME     jrpc-202208123456879-123456789.us-west-2.elb.amazonaws.com.
  ```
* एक बार जब cname रिकॉर्ड प्रोपोगेट हो जाए, तो JSON-PRC एंडपॉइंट को कॉल करके चेक करें कि क्या चेन ठीक से काम कर रही है.   
  ऊपर दिए गए उदाहरण से:
  ```shell
    curl  https://rpc.my-awsome-blockchain.com -X POST -H "Content-Type: application/json" --data '{"jsonrpc":"2.0","method":"eth_chainId","params":[],"id":1}'
  ```

## डेस्ट्रॉय करने की प्रक्रिया {#destroy-procedure}
:::warning

नीचे दी गई प्रक्रिया स्थायी रूप से इन terraform स्क्रिप्ट     के साथ डिप्लॉय आपके पूरे इंफ्रास्ट्रक्चर को हटा देगी.
सुनिश्चित करें कि आपके पास उचित [ब्लॉकचेन डेटा बैकअप](docs/edge/working-with-node/backup-restore) है और/या आप एक टेस्टिंग क्षेत्र में काम कर रहे हैं.

:::

अगर आपको पूरे इंफ्रास्ट्रक्चर को हटाने की ज़रूरत है, तो नीचे दिए गए कमांड को रन करें `terraform destroy`.    इसके अतिरिक्त, आपको डिप्लॉय वाले क्षेत्र के लिए [AWS Parameter Store](https://aws.amazon.com/systems-manager/features/) में संग्रहीत सीक्रेट को
मैन्युअल रूप से हटाने की ज़रूरत होगी.
