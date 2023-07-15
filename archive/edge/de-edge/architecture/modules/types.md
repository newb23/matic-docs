---
id: types
title: Arten
description: Erläuterung für das Types Modul von Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - types
  - marshaling
---

## Übersicht {#overview}

Das **Types** Modul implementiert core Objektarten, wie z. B.:

* **Adresse**
* **Hash**
* **Header**
* viele Helferfunktionen

## RLP Encoding / Decoding {#rlp-encoding-decoding}

Anders als Clients wie GETH verwendet der Polygon Edge keine Reflexion für die Codierung.<br /> Die Präferenz war, die Reflexion nicht zu verwenden, da sie neue Probleme, wie z. B. die Leistung, Abbau, und härtere Skalierung mit sich bringt.

Das **Types** Modul bietet eine einfach zu bedienende Schnittstelle für RLP Marshaling und Unmarshalling, mit dem FastRLP Paket.

Marshaling wird durch die *MarshalRLPWith* und *MarshalRLPTo* durchgeführt. Die analogen Methoden existieren für Unmarshalling.

Indem er diese Methoden manuell definiert, muss Polygon Edge keine Reflexion verwenden. In *rlp_marshal.go* können Sie Methoden für Marshaling finden:

* **Bodies**
* **Blöcke**
* **Headers**
* **Receipts**
* **Logs**
* **Transactions**