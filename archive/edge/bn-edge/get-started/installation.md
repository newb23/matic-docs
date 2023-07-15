---
id: installation
title: ইনস্টলেশন
description: "কীভাবে Polygon Edge ইনস্টল করবেন।"
keywords:
  - docs
  - polygon
  - edge
  - install
  - installation
---

অনুগ্রহ করে আপনার জন্য আরও বেশি প্রযোজ্য ইনস্টলেশন পদ্ধতিটি পড়ুন।

আমাদের সুপারিশ হচ্ছে প্রি-বিল্ট রিলিজ ব্যবহার করুন এবং প্রদত্ত চেকসামটি যাচাই করুন।

## প্রি-বিল্ট রিলিজ {#pre-built-releases}

রিলিজগুলোর একটি তালিকার জন্য, অনুগ্রহ করে [GitHub রিলিজ](https://github.com/0xPolygon/polygon-edge/releases) পৃষ্ঠাটি দেখুন।

Polygon Edge-এ Darwin এবং Linux-এর জন্য ক্রস-কম্পাইলড AMD64/ARM64 বাইনারির সুবিধা পাওয়া যায়।

---

## ডকার ইমেজ {#docker-image}

অফিসিয়াল ডকার ইমেজ [hub.docker.com রেজিস্ট্রিতে](https://hub.docker.com/r/0xpolygon/polygon-edge) হোস্ট করা আছে।

`docker pull 0xpolygon/polygon-edge:latest`

---

## উৎস থেকে নির্মাণ {#building-from-source}

`go install` ব্যবহার করার আগে নিশ্চিত হয়ে নিন যে আপনি Go `>=1.18` ইনস্টল করেছেন এবং সেটি সঠিকভাবে কনফিগার করেছেন।

স্থিতিশীল ব্রাঞ্চটি হচ্ছে সর্বশেষ রিলিজের ব্রাঞ্চ।

```shell
git clone https://github.com/0xPolygon/polygon-edge.git
cd polygon-edge/
go build -o polygon-edge main.go
sudo mv polygon-edge /usr/local/bin
```

---

## `go install` ব্যবহার করা

`go install` ব্যবহার করার আগে নিশ্চিত হয়ে নিন যে আপনি Go `>=1.17` ইনস্টল করেছেন এবং সেটি সঠিকভাবে কনফিগার করেছেন।

`go install github.com/0xPolygon/polygon-edge@release/<latest release>`

বাইনারি আপনার `GOBIN`এনভায়রনমেন্ট variable, পাওয়া যাবে, এবং সর্বশেষ রিলিজের পরিবর্তনগুলো অন্তর্ভুক্ত থাকবে। আপনি কোনটি সর্বশেষ which া তা খুঁজে বের করতে [GitHub রিলিজ](https://github.com/0xPolygon/polygon-edge/releases) আউট চেকআউট করতে পারেন।
