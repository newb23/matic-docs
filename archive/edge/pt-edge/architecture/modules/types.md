---
id: types
title: Tipos
description: Explicação para o módulo Tipos do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Visão geral {#overview}

O módulo **Tipos** implementa os tipos de objeto do núcleo, como:

* **Endereço**
* **Hash**
* **Cabeçalho**
* muitas funções auxiliares

## Codificação/Decodificação de RLP {#rlp-encoding-decoding}

Diferente de clientes como GETH, o Polygon Edge não usa a reflexão para a codificação.<br />
A preferência não era usar a reflexão porque isso introduz novos problemas, como degradação de
desempenho e escalonamento mais difícil.

O módulo **Tipos** fornece uma interface fácil de usar para empacotar e desempacotar RLP, usando o pacote FastRLP.

O empacotamento é realizado através dos métodos *MarshalRLPWith* e *MarshalRLPWith*. Os métodos análogos existem para
desempacotamento.

Ao definir manualmente estes métodos, o Polygon Edge não precisa usar a reflexão. Em *rlp_marshal.go*, é possível encontrar os
métodos para empacotamento:

* **Corpos**
* **Blocos**
* **Cabeçalhos**
* **Recebimentos**
* **Registos**
* **Transações**