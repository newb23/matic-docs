---
id: set-up-aws-ssm
title: Configure o SSM (Gestor de sistemas) da AWS
description: "Configure o SSM (Gestor de sistemas) da AWS para o Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - aws
  - ssm
  - secrets
  - manager
---

## Visão geral {#overview}

Atualmente, o Polygon Edge está preocupado em guardar 2 grandes segredos do tempo de execução:
* A **chave privada de validador** usada pelo nó, se este for um validador
* A **chave privada de rede** usada pelo libp2p, para participação e comunicação com outros pares

Para informações adicionais, leia atentamente o [Guia Gerir Chaves Privadas](/docs/edge/configuration/manage-private-keys)

Os módulos do Polygon Edge **não devem precisar de saber como guardar segredos**. Finalmente, um módulo não deve preocupar-se com
o facto de um segredo ser guardado num servidor longínquo ou localmente, no disco do nó.

Tudo o que um módulo precisa de saber sobre como manter um segredo é **saber usar o segredo**, **saber que segredos obter
ou guardar**. Os detalhes de implementação mais finos destas operações são delegados no `SecretsManager`, que consiste numa abstração, claro.

O operador de nós que está a iniciar o Polygon Edge pode agora especificar que gestor de segredos pretende usar e, assim que
o gestor de segredos correto é instanciado, os módulos lidam com os segredos através da interface mencionada -
sem se importar se tais segredos são armazenados num disco ou num servidor.

Este artigo detalha os passos necessários para colocar o Polygon Edge em execução com
[AWS Systems Manager Parameter Store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-parameter-store.html).

:::info guias anteriores

**Recomendamos vivamente** que, antes de seguir este artigo, leia os artigos sobre [**Configuração Local**](/docs/edge/get-started/set-up-ibft-locally)
e [**Configuração na Nuvem**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Pré-requisitos {#prerequisites}
### Política do IAM {#iam-policy}
O utilizador precisa criar uma Política do IAM que permita operações de leitura/gravação para o AWS Systems Manager Parameter Store.
Depois de criar com sucesso a Política do IAM, o utilizador precisa vinculá-la à instância do EC2 que está a executar o servidor da Polygon Edge.
A Política do IAM deve ser semelhante a algo como:
```json
{
  "Version": "2012-10-17",
  "Statement" : [
    {
      "Effect" : "Allow",
      "Action" : [
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "ssm:GetParameter"
      ],
      "Resource" : [
        "arn:aws:ssm:<aws_region>:<aws_account_id>:parameter<ssm-parameter-path>*"
      ]
    }
  ]
}
```
Mais informações sobre as funções de IAM do SSM da AWS podem ser encontradas nos [documentos da AWS](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-profile.html).

Informações necessárias antes de continuar:
* **Região** (a região na qual reside o Gestor de Sistemas e os nós)
* **Caminho do parâmetro** (caminho arbitrário no qual o segredo será colocado em, por exemplo`/polygon-edge/nodes`)

## Etapa 1 - gere a configuração do gestor de segredos {#step-1-generate-the-secrets-manager-configuration}

Para conseguir se comunicar perfeitamente com o SSM da AWS, o Polygon Edge tem de analisar um
ficheiro config já gerado, que contém todas as informações necessárias para o armazenamento de segredos no SSM da AWS.

Para gerar a configuração, execute o seguinte comando:

```bash
polygon-edge secrets generate --type aws-ssm --dir <PATH> --name <NODE_NAME> --extra region=<REGION>,ssm-parameter-path=<SSM_PARAM_PATH>
```

Parâmetros presentes:
* `PATH`é o caminho para o qual o ficheiro de configuração deve ser exportado. `./secretsManagerConfig.json` padrão
* `NODE_NAME`é o nome do nó atual para o qual a configuração do SSM da AWS está a ser definida. Pode ser um valor arbitrário. `polygon-edge-node` padrão
* `REGION` é a região onde o SSM do AWS reside. Ela tem de ser a mesma região do nó que utiliza o SSM da AWS.
* `SSM_PARAM_PATH` é o nome do caminho onde o segredo será armazenado. Por exemplo, se `--name node1` e `ssm-parameter-path=/polygon-edge/nodes`
forem especificados, o segredo será armazenado como `/polygon-edge/nodes/node1/<secret_name>`

:::caution Nomes dos nós

Tenha cuidado ao especificar os nomes dos nós.

O Polygon Edge usa o nome do nó especificado para acompanhar os segredos que gera e usa no SSM da AWS.
Especificar um nome do nó existente pode ter consequências de não gravar o segredo no SSM da AWS.

Os segredos são armazenados no seguinte caminho base: `SSM_PARAM_PATH/NODE_NAME`

:::

## Etapa 2 - inicializar as chaves secretas usando a configuração {#step-2-initialize-secret-keys-using-the-configuration}

Agora que o ficheiro de configuração está presente, podemos inicializar as chaves secretas necessárias com o ficheiro de configuração
definido na etapa 1, usando a `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

O parâmetro `PATH` é a localização do parâmetro do gestor de segredos previamente gerado na etapa 1.

:::info Política do IAM

Esta etapa irá falhar se a Política do IAM que permite operações de leitura/gravação não estiver configurada corretamente e/ou não estiver vinculada à instância do EC2 que executa este comando.

:::

## Etapa 3 - gere o ficheiro de génese {#step-3-generate-the-genesis-file}

O ficheiro de génese deve ser gerado de forma semelhante à dos guias [**Configuração Local**](/docs/edge/get-started/set-up-ibft-locally)
e [**Configuração na Nuvem**](/docs/edge/get-started/set-up-ibft-on-the-cloud), com ligeiras alterações.

Uma vez que o SSM da AWS está a ser usado em vez do sistema de ficheiros local, os endereços de validador devem ser adicionados através do sinalizador `--ibft-validator`:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Etapa 4 - inicie o cliente do Polygon Edge {#step-4-start-the-polygon-edge-client}

Agora que as chaves estão configuradas e o ficheiro de génese foi gerado, a etapa final deste processo seria a iniciação do
Polygon Edge com o comando `server`.

O comando `server` é usado da mesma forma que nos guias anteriormente mencionados, com uma adição ligeira - o flag `--secrets-config`:
```bash
polygon-edge server --secrets-config <PATH> ...
```

O parâmetro `PATH` é a localização do parâmetro do gestor de segredos previamente gerado na etapa 1.