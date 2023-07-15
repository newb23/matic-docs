---
id: manage-private-keys
title: Gerir chaves privadas
description: "Como gerir chaves privadas e que tipos de chaves existem."
keywords:
  - docs
  - polygon
  - edge
  - private
  - key
  - keystore
---

## Visão geral {#overview}

O Polygon Edge tem dois tipos de chaves privadas que gere diretamente:

* **Chave privada para o mecanismo de consenso**
* **Chave privada usada para networking por libp2p**
* **(Opcional) Chave privada BLS usada para o mecanismo de consenso para agregar as assinaturas dos validadores**

Atualmente, o Polygon Edge não oferece suporte para a gestão direta de contas.

Com base na estrutura do diretório descrita no [guia de Backup e Recuperação](/docs/edge/working-with-node/backup-restore),
o Polygon Edge armazena os ficheiros das chaves mencionados em dois diretórios distintos - **consensus** e **keystore**.

## Formato das chaves {#key-format}

As chaves privadas são armazenadas num **formato Base64** simples para que sejam legíveis e portáteis.

```bash
# Example private key
0802122068a1bdb1c8af5333e58fe586bc0e9fc7aff882da82affb678aef5d9a2b9100c0
```

:::info Tipo de chave

Todos os ficheiros de chaves privadas gerados e usados dentro do Polygon Edge baseiam-se no ECDSA com a curva [secp256k1](https://en.bitcoin.it/wiki/Secp256k1).

Como a curva não é padrão, não pode ser codificada e armazenada em qualquer formato PEM padronizado.
Não é suportada a importação de chaves que não estejam em conformidade com este tipo de chave.

:::
## Chave privada de consenso {#consensus-private-key}

O ficheiro de chave privada mencionado como *chave privada de consenso* é também designado **chave privada de validador**.
Esta chave privada é usada quando o nó age como validador na rede e precisa de assinar dados novos.

O ficheiro de chave privada está localizado em `consensus/validator.key` e segue o [formato de chave](/docs/edge/configuration/manage-private-keys#key-format) mencionado.

:::warning

A chave privada de validador é exclusiva para cada nó de validador. A mesma chave <b>não</b> deve ser partilhada entre validadores, pois pode comprometer a segurança da sua chain.

:::

## Chave privada de networking {#networking-private-key}

O ficheiro de chave privada mencionado para networking é usado pelo libp2p para gerar a PeerID correspondente e permitir que o nó participe na rede.

Está localizado em `keystore/libp2p.key` e segue o [formato de chave](/docs/edge/configuration/manage-private-keys#key-format) mencionado.

## Chave secreta BLS {#bls-secret-key}

O ficheiro de chave secreta BLS é usado para agregar selos dedicados na camada de consenso. O tamanho dos selos dedicados agregados pela BLS é inferior às assinaturas ECDSA dedicadas serializadas.

O recurso BLS é opcional e é possível escolher usá-lo ou não. Consulte [BLS](/docs/edge/consensus/bls) para mais detalhes.

## Importar/Exportar {#import-export}

Como os ficheiros de chave são armazenados no disco no formato Base64 simples, eles podem ser facilmente copiados ou importados.

:::caution Alterar os ficheiros das chaves

Qualquer tipo de alteração aos ficheiros de chave numa rede já configurada/em execução pode levar a uma perturbação grave da rede/do consenso,
dado que os mecanismos de consenso e de descoberta de pares armazenam os dados derivados destas chaves num armazenamento específico dos nós e dependem destes dados para
iniciar conexões e executar a lógica de consenso

:::