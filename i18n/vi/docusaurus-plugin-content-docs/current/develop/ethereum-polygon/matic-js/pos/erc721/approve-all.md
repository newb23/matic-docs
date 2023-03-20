---
id: approve-all
title: approveAll
keywords:
- 'pos client, erc721, approveAll, polygon, sdk'
description: 'Phê duyệt tất cả token.'
---

Có thể sử dụng phương pháp `approveAll` để phê duyệt tất cả token.

```
const erc721RootToken = posClient.erc721(<root token address>, true);

const approveResult = await erc721RootToken.approveAll();

const txHash = await approveResult.getTransactionHash();

const txReceipt = await approveResult.getReceipt();

```