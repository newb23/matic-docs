---
id: definitions
title: Allgemeine Definitionen
description: Allgemeine Definitionen für in ChainBridge verwendete Begriffe
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Relayer {#relayer}
ChainBridge ist eine Bridge vom Typ Relayer. Die Rolle eines Relayers besteht darin, für die Ausführung einer Anfrage zu stimmen (z.B. wie viele Token gebrannt/freigegeben werden sollen).
Er überwacht Ereignisse aus jeder Chain und stimmt für einen Vorschlag im Bridge-Contract der Destination-Chain, wenn er ein `Deposit`Event von einer Chain erhält. Ein Relayer ruft eine Methode im Bridge-Contract auf, um den Vorschlag auszuführen, nachdem die erforderliche Anzahl an Stimmen abgegeben wurde. Die Bridge delegiert die Ausführung an den Handler-Contract.


## Contract-Arten {#types-of-contracts}
In ChainBridge gibt es in jeder Chain drei Arten von Contracts, Bridge/Handler/Target genannt.

| **Art** | **Beschreibung** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Bridge-Contract | In jeder Chain muss ein Bridge-Contract implementiert werden, der Anfragen, Abstimmungen und Ausführungen verwaltet. Benutzer rufen `deposit`in Bridge auf, um eine Übertragung zu starten, und Bridge delegiert den Vorgang an den Handler-Contract, der dem Target-Contract entspricht. Sobald der Handler-Contract den Target-Contract erfolgreich aufgerufen hat, sendet der Bridge-Contract ein `Deposit`Event, um die Relayers zu informieren. |
| Handler-Contract | Dieser Contract interagiert mit dem Target-Contract, um eine Einzahlung oder einen Vorschlag auszuführen. Er validiert die Anfrage des Benutzers, ruft den Target-Contract auf und unterstützt bei einigen Einstellungen im Target-Contract. Es gibt gewisse Handler-Contracts, die jeden Target-Contract aufrufen, der über eine andere Schnittstelle verfügt. Durch die indirekten Aufrufe des Handler-Vertrags ermöglicht die Bridge die Übertragung von Assets oder Daten jeglicher Art. Derzeit gibt es drei Arten von Handler-Contracts, die von ChainBridge implementiert werden: ERC20Handler, ERC721Handler und GenericHandler. |
| Target-Contract | Ein Contract, der die auszutauschenden Assets oder die Nachrichten, die zwischen den Chains übertragen werden, verwaltet. Die Interaktion mit diesem Contract wird von jeder Seite der Bridge aus durchgeführt. |

<div style={{textAlign: 'center'}}>

![ChainBridge Architektur](/img/edge/chainbridge/architecture.svg)
*ChainBridge Architektur*

</div>

<div style={{textAlign: 'center'}}>

![Workflow der ERC20-Token-Übertragung](/img/edge/chainbridge/erc20-workflow.svg)
*z. B. Workflow einer ERC20-Token-Übertragun*g

</div>

## Kontotypen {#types-of-accounts}

Sicherstellen, dass die Konten genügend native Token haben, um Transaktionen zu erstellen, bevor Sie loslegen. In Polygon Edge können Sie bei der Erstellung des Genesis-Blocks den Konten vorab ermittelte Salden zuweisen.

| **Art** | **Beschreibung** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Admin | Diesem Konto wird standardmäßig die Rolle des Administrators zugewiesen. |
| Benutzer | Das Sender-/Empfängerkonto, das Assets sendet/empfängt. Das Senderkonto zahlt die Gebühren (Gas) bei der Genehmigung von Token-Transfers und ruft die Einzahlung im Bridge-Contract auf, um eine Übertragung zu beginnen. |

:::info Die Administratorrolle

Bestimmte Aktionen können nur von einem Konto mit Administratorrolle durchgeführt werden. Standardmäßig hat derjenige, der den Bridge-Contract bereitstellt, die Administratorrolle. Im Folgenden erfahren Sie, wie Sie die Administratorrolle einem anderen Konto zuweisen oder sie entfernen können.

### Administratorrolle hinzufügen {#add-admin-role}

Fügt einen Administrator hinzu

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Administratorrolle widerrufen {#revoke-admin-role}

Entfernt einen Administrator

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## Die mit dem `admin`Konto möglichen Operationen sind die Folgenden. {#account-are-as-below}

### Ressource einstellen {#set-resource}

Registrierung einer Ressourcen-ID mit einer Vertragsadresse für einen Handler.

```bash
# Register new resource
$ cb-sol-cli bridge register-resource \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --targetContract "[TARGET_CONTRACT_ADDRESS]"
```

### Einen Contract erstellen, mit dem Coins ausgeschieden/förderbar gemacht werden können {#make-contract-burnable-mintable}

Einen Token-Contract in einem Handler als förderbar/ausscheidbar festlegen.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Vorschlag abbrechen {#cancel-proposal}

Vorschlag für die Ausführung abbrechen

```bash
# Cancel ongoing proposal
$ cb-sol-cli bridge cancel-proposal \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --resourceId "[RESOURCE_ID]" \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --chainId "[CHAIN_ID_OF_SOURCE_CHAIN]" \
  --depositNonce "[NONCE]"
```

### Pause/Unterbrechung {#pause-unpause}

Einzahlungen, Vorschlagserstellung, Abstimmungen und Einzahlungsausführungen zeitlich unterbrechen.

```bash
# Pause
$ cb-sol-cli admin pause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"

# Unpause
$ cb-sol-cli admin unpause \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]"
```

### Gebühr ändern {#change-fee}

Ändern Sie die Gebühr, die an den Bridge-Contract entrichtet wird

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Einen Relayer hinzufügen/entfernen {#add-remove-a-relayer}

Konto als neuen Relayer hinzufügen oder ein Relayer-Konto entfernen

```bash
# Add relayer
$ cb-sol-cli admin add-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[NEW_RELAYER_ADDRESS]"

# Remove relayer
$ cb-sol-cli admin remove-relayer \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --relayer "[RELAYER_ADDRESS]"
```

### Schwellenwert für Relayer ändern {#change-relayer-threshold}

Ändern Sie die Anzahl der erforderlichen Stimmen für die Ausführung eines Vorschlags

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## Chain-ID {#chain-id}

Die ChainBridge `chainId`ist ein beliebiger Wert, der in der Bridge zur Unterscheidung zwischen den Blockchain-Netzwerken verwendet wird und im Bereich von uint8 liegen muss. Nicht zu verwechseln mit der Chain-ID des Netzwerks, das ist nicht das gleich. Dieser Wert muss zwar eindeutig sein, aber er muss nicht mit der ID des Netzwerks übereinstimmen.

In diesem Beispiel setzen wir i`99`n, w`chainId`eil die Chain-ID des Mumbai-Testnets ist`80001`, was nicht mit einem uint8 dargestellt werden kann.

## Ressourcen-ID {#resource-id}

Eine Ressourcen-ID ist ein eindeutiger 32-Byte-Wert in einer Cross-Chain-Umgebung, der mit einem bestimmten Asset (Ressource) verbunden ist, das zwischen Netzwerken übertragen wird.

Die Ressourcen-ID ist frei wählbar. In der Regel enthält das letzte Byte jedoch die Chain-ID der Source-Chain (das Netzwerk, aus dem dieses Asset stammt).

## JSON-RPC URL für Polygon PoS {#json-rpc-url-for-polygon-pos}

Für diese Anleitung verwenden wir https://rpc-mumbai.matic.today, eine öffentliche JSON-RPC-URL, die von Polygon zur Verfügung gestellt wird und möglicherweise Datenübertragungs- oder Leistungsbeschränkungen hat. Dies dient nur zur Verbindung mit dem Polygon Mumbai Testnet. Wir empfehlen Ihnen, Ihre JSON-RPC-URL über einen externen Dienst wie Infura zu beziehen, da bei der Einrichtung von Verträgen viele Abfragen an den JSON-RPC gesendet werden.

## Möglichkeiten zur Übertragung von Token {#ways-of-processing-the-transfer-of-tokens}
Bei der Übertragung von ERC20-Tokens zwischen Chains können diese in zwei verschiedenen Modi verarbeitet werden:

### Sperren/Freigeben Modus {#lock-release-mode}
<b>Source-Chain:</b> Die versendeten Token werden im Handler-Contract gesperrt.
D<br/><b>estination-Chain:</b> Die gleiche Menge an in der Source-Chain gesendeten Token, wird freigeschaltet und vom Handler-Contract auf das Empfängerkonto in der Destination-Chain übertragen.

### Ausscheiden/Fördern-Modus {#burn-mint-mode}
<b>Source-Chain:</b> Die versendeten Token werden ausgeschieden. De<br/><b>stination-Chain:</b> Die gleiche Menge an Token, die Sie in der Source-Chain gesendet und ausgeschieden haben, wird auf der Destination-Chain ausgestellt und an das Empfängerkonto gesendet.

Für jede Chain können Sie verschiedene Modi nutzen. Das bedeutet, dass ein Token in der Mainchain sperrbar ist, während ein Token in der Subchain für die Übertragung ausgegeben wird. So kann es zum Beispiel sinnvoll sein, Token zu sperren/freizugeben, wenn der Gesamtvorrat oder der Ausstellungszeitplan kontrolliert wird. Token würden ausgestellt/ausgeschieden, wenn der Contract in der Subchain dem Angebot in der Haupt-Chain folgen muss.

Der Standardmodus ist der Sperren/Freigeben Modus. Möchten Sie die Token ausstellbar/ausscheidbar machen, müssen Sie die `adminSetBurnable`Methode wählen. Wenn Sie die Token bei der Ausführung ausstellen möchten, müssen Sie dem ERC20 Handler-Contract die Rolle `minter`zuweisen.


