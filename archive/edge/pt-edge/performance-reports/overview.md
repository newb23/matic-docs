---
id: overview
title: Visão geral
description: "Introdução aos testes com o Polygon Edge."
keywords:
  - docs
  - polygon
  - edge
  - performance
  - tests
  - loadbot
---
:::caution
Observe que o nosso , `loadbot`que foi usado para realizar estes testes, está agora desvalorizado.
:::

| Tipo | Valor | Link para o teste |
| ---- | ----- | ------------ |
| Transferências regulares | 1428 tps | [4 de julho de 2022](test-history/test-2022-07-04.md#results-of-eoa-to-eoa-transfers) |
| Transferências ERC-20 | 1111 tps | [4 de julho de 2022](test-history/test-2022-07-04.md#results-of-erc20-token-transfers) |
| Minerar NFT | 714 tps | [4 de julho de 2022](test-history/test-2022-07-04.md#results-of-erc721-token-minting) |

---

O nosso objetivo é fazer um software de cliente blockchain de alto desempenho, rico em recursos e fácil de configurar e manter.
Todos os testes foram feitos usando o Polygon Edge Loadbot.
Cada relatório de desempenho que encontrará nesta secção está devidamente datado, o ambiente está claramente descrito e o método de teste claramente explicado.

O objetivo destes testes de desempenho consiste em mostrar o desempenho prático real da rede blockchain Polygon Edge.
Qualquer pessoa deve ser capaz de obter os mesmos resultados que foram publicados aqui, no mesmo ambiente, usando o nosso loadbot.

Todos os testes de desempenho foram realizados na plataforma AWS, numa chain que consiste em nós de instância EC2.