---
id: set-up-hashicorp-vault
title: Configurar o Hashicorp Vault
description: "Configurar o Hashicorp Vault para o Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - hashicorp
  - vault
  - secrets
  - manager
---

## Visão geral {#overview}

Atualmente, o Polygon Edge está preocupado em guardar 2 grandes segredos do tempo de execução:
* A **chave privada de validador** usada pelo nó, se este for um validador
* A **chave privada de networking** usada pelo libp2p, para participar e comunicar com outros pares

:::warning

A chave privada de validador é exclusiva para cada nó de validador. A mesma chave <b>não</b> deve ser partilhada entre validadores, pois pode comprometer a segurança da sua chain.

:::

Para informações adicionais, leia atentamente o [Guia Gerir Chaves Privadas](/docs/edge/configuration/manage-private-keys)

Os módulos do Polygon Edge **não devem precisar de saber como guardar segredos**. Finalmente, um módulo não deve preocupar-se com
o facto de um segredo ser guardado num servidor longínquo ou localmente, no disco do nó.

Tudo o que um módulo precisa de saber sobre como manter um segredo é **saber usar o segredo**, **saber que segredos obter
ou guardar**. Os detalhes de implementação mais finos destas operações são delegados no `SecretsManager`, que consiste numa abstração, claro.

O operador de nós que está a iniciar o Polygon Edge pode agora especificar que gestor de segredos pretende usar e, assim que
o gestor de segredos correto é instanciado, os módulos lidam com os segredos através da interface mencionada -
sem se importarem se os segredos são armazenados num disco ou num servidor.

Este artigo detalha os passos necessários para colocar o Polygon Edge em execução com um servidor [Hashicorp Vault](https://www.vaultproject.io/).

:::info guias anteriores

**Recomendamos vivamente** que, antes de seguir este artigo, leia os artigos sobre [**Configuração Local**](/docs/edge/get-started/set-up-ibft-locally)
e [**Configuração na Nuvem**](/docs/edge/get-started/set-up-ibft-on-the-cloud).

:::


## Pré-requisitos {#prerequisites}

Este artigo assume que uma instância funcional do servidor Hashicorp Vault **já foi configurada**.

Além disso, é necessário que o servidor Hashicorp Vault que está a ser usado para o Polygon Edge tenha o **armazenamento de chave-valor ativado**.

Informações necessárias antes de continuar:
* **O URL do servidor** (URL da API do servidor Hashicorp Vault)
* **Token** (token usado para acesso ao motor de armazenamento de chave-valor)

## Etapa 1 - gerar a configuração do gestor de segredos {#step-1-generate-the-secrets-manager-configuration}

Para conseguir comunicar perfeitamente com o servidor Vault, o Polygon Edge tem de analisar um
ficheiro config já gerado, que contém todas as informações necessárias para o armazenamento de segredos no Vault.

Para gerar a configuração, execute o seguinte comando:

```bash
polygon-edge secrets generate --dir <PATH> --token <TOKEN> --server-url <SERVER_URL> --name <NODE_NAME>
```

Parâmetros presentes:
* `PATH`é o caminho para o qual o ficheiro de configuração deve ser exportado. `./secretsManagerConfig.json` padrão
* `TOKEN` é o token de acesso mencionado anteriormente na [secção pré-requisitos](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `SERVER_URL`é o URL da API para o servidor Vault, também mencionado na [secção pré-requisitos](/docs/edge/configuration/secret-managers/set-up-hashicorp-vault#prerequisites)
* `NODE_NAME`é o nome do nó atual para o qual a configuração do Vault está a ser configurada como tal. Pode ser um valor arbitrário. `polygon-edge-node` padrão

:::caution Nomes dos nós

Tenha cuidado ao especificar os nomes dos nós.

O Polygon Edge usa o nome do nó especificado para acompanhar os segredos que gera e usa na instância do Vault.
A especificação de um nome de nó existente pode ter como consequência a substituição de dados no servidor do Vault.

Os segredos são armazenados no seguinte caminho base: `secrets/node_name`

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
e [**Configuração na Nuvem**](/docs/edge/get-started/set-up-ibft-on-the-cloud), com ligeiras alterações.

Uma vez que o Hashicorp Vault está a ser usado em vez do sistema de ficheiros local, os endereços de validador devem ser adicionados através do flag `--ibft-validator`:
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