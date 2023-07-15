---
id: set-up-gcp-secrets-manager
title: Configurar o gestor de segredos do GCP
description: "Configurar o gestor de segredos do GCP para o Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - gcp
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
sem se importarem se os segredos são armazenados num disco ou num servidor.

Este artigo detalha os passos necessários para colocar o Polygon Edge em execução com o [Gestor de Segredos do GCP](https://cloud.google.com/secret-manager).

:::info guias anteriores

**Recomendamos vivamente** que, antes de seguir este artigo, leia os artigos sobre [**Configuração Local**](/docs/edge/get-started/set-up-ibft-locally)
e [**Configuração na Nuvem**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Pré-requisitos {#prerequisites}
### Conta de faturação do GCP {#gcp-billing-account}
Para utilizar o Gestor de Segredos do GCP, o utilizador tem de ter a [Conta de faturação](https://console.cloud.google.com/) ativada no portal do GCP.
As contas novas do Google na plataforma do GCP são fornecidas com alguns fundos para começarem, como corolário da avaliação gratuita.
Mais informações em [GCP docs](https://cloud.google.com/free)

### API do Gestor de Segredos {#secrets-manager-api}
O utilizador terá de ativar a API do Gestor de Segredos do GCP, antes de poder usá-la.
Isto pode ser feito através do [portal da API do Gestor de Segredos](https://console.cloud.google.com/apis/library/secretmanager.googleapis.com). Mais informações: [Configurar o Gestor de Segredos](https://cloud.google.com/secret-manager/docs/configuring-secret-manager)

### Credenciais do GCP {#gcp-credentials}
Por último, o utilizador precisa de gerar novas credenciais que serão usadas para autenticação.
Isto pode ser feito seguindo as instruções publicadas [aqui](https://cloud.google.com/secret-manager/docs/reference/libraries).   
O ficheiro json gerado que contém as credenciais deve ser transferido para cada nó que necessitar de usar o Gestor de Segredos do GCP.

Informações necessárias antes de continuar:
* **ID do projeto** (identificação do projeto definida na plataforma do GCP)
* **Localização do ficheiro das credenciais** (caminho para o ficheiro json que contém as credenciais)

## Etapa 1 - gerar a configuração do gestor de segredos {#step-1-generate-the-secrets-manager-configuration}

Para conseguir comunicar perfeitamente com o GCP SM, o Polygon Edge tem de analisar um
ficheiro config já gerado, que contém todas as informações necessárias para o armazenamento de segredos no GCP SM.

Para gerar a configuração, execute o seguinte comando:

```bash
polygon-edge secrets generate --type gcp-ssm --dir <PATH> --name <NODE_NAME> --extra project-id=<PROJECT_ID>,gcp-ssm-cred=<GCP_CREDS_FILE>
```

Parâmetros presentes:
* `PATH`é o caminho para o qual o ficheiro de configuração deve ser exportado. Predefinição `./secretsManagerConfig.json`
* `NODE_NAME`é o nome do nó atual para o qual a configuração do GCP SM está a ser configurada como tal. Pode ser um valor arbitrário. Predefinição `polygon-edge-node`
* `PROJECT_ID` é a identificação do projeto que o utilizador definiu na consola do GCP durante a configuração da conta e a ativação da API do Gestor de Segredos.
* `GCP_CREDS_FILE` é o caminho para o ficheiro json que contém as credenciais que permitirão o acesso de leitura/escrita do Gestor de Segredos.

:::caution Nomes dos nós

Tenha cuidado ao especificar os nomes dos nós.

O Polygon Edge usa o nome do nó especificado para acompanhar os segredos que gera e usa no GCP SM.
A especificação de um nome de nó existente pode ter como consequência a falha na escrita do segredo no GCP SM.

Os segredos são armazenados no seguinte caminho base: `projects/PROJECT_ID/NODE_NAME`

:::

## Etapa 2 - inicializar as chaves secretas usando a configuração {#step-2-initialize-secret-keys-using-the-configuration}

Agora que o ficheiro de configuração está presente, podemos inicializar as chaves secretas necessárias com o ficheiro de configuração
definido na etapa 1, usando a `--config`:

```bash
polygon-edge secrets init --config <PATH>
```

O parâmetro `PATH` é a localização do parâmetro do gestor de segredos previamente gerado na etapa 1.

## Etapa 3 - gerar o ficheiro de génese {#step-3-generate-the-genesis-file}

O ficheiro de génese deve ser gerado de forma semelhante à dos guias [**Configuração Local**](/docs/edge/get-started/set-up-ibft-locally)
e [**Configuração da Nuvem**](/docs/edge/get-started/set-up-ibft-on-the-cloud), com ligeiras alterações.

Uma vez que o GCP SM está a ser usado em vez do sistema de ficheiros local, os endereços de validador devem ser adicionados através do flag `--ibft-validator`:
```bash
polygon-edge genesis --ibft-validator <VALIDATOR_ADDRESS> ...
```

## Etapa 4 - iniciar o cliente do Polygon Edge {#step-4-start-the-polygon-edge-client}

Agora que as chaves estão configuradas e o ficheiro de génese foi gerado, a etapa final deste processo seria a iniciação do
Polygon Edge com o comando `server`.

O comando `server` é usado da mesma forma que nos guias anteriormente mencionados, com uma adição ligeira - o flag `--secrets-config`:
```bash
polygon-edge server --secrets-config <PATH> ...
```

O parâmetro `PATH` é a localização do parâmetro do gestor de segredos previamente gerado na etapa 1.