---
id: definitions
title: Definizioni generali
description: Definizioni generali per i termini utilizzati nella chainBridge
keywords:
  - docs
  - polygon
  - edge
  - Bridge
---


## Relayer {#relayer}
Chainbridge è un bridge di tipo relayer. Il ruolo di un relayer è votare per l'esecuzione di una richiesta (ad esempio, quanti token da bruciare/rilasciare).
Monitora gli eventi da ogni chain, e vota una proposta nel contratto bridge della chain di destinazione quando riceverà un `Deposit` evento da una chain. Un relayer chiama un metodo nel contratto bridge per eseguire la proposta dopo che il numero di voti richiesto sia stato inviato. Il bridge delega l'esecuzione al contratto Handler.


## Tipi di contratti {#types-of-contracts}
In ChainBridge, ci sono tre tipi di contratto su ciascuna chain, chiamati Bridge/Handler/Target.

| **Tipo** | **Descrizione** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Contratto bridge | Un contratto bridge che gestisce le richieste, i voti e le esecuzioni deve essere implementato in ogni chain. Gli utenti chiameranno `deposit` in Bridge per avviare il trasferimento, e Bridge delega il processo al contratto Handler corrispondente al contratto Target. Una volta che il contratto Handler è riuscito a chiamare il contratto Target, il contratto Bridge emette un evento `Deposit` per avvisare i relayer. |
| Contratto Handler | Questo contratto interagisce con il contratto Target per effettuare un deposito o una proposta. Convalida la richiesta dell'utente, chiama il contratto Target e fornisce aiuto con alcune impostazioni per il contratto Target. Ci sono alcuni contratti Handler per chiamare ciascun contratto Target che presentano un'interfaccia diversa. Le chiamate indirette effettuate dal contratto Handler fanno il bridge per consentire il trasferimento di qualsiasi tipo di asset o dato. Attualmente, esistono tre tipi di contratti Handler implementati da ChainBridge: ERC20Handler, ERC721Handler e GenericHandler. |
| Contratto Target | Un contratto che gestisce gli asset da scambiare o i messaggi che vengono trasferiti tra le chain. L'interazione con questo contratto verrà effettuata da ogni lato del bridge. |

<div style={{textAlign: 'center'}}>

![Architettura di ChainBridge](/img/edge/chainbridge/architecture.svg)
*Architettura di ChainBridge*

</div>

<div style={{textAlign: 'center'}}>

![Flusso di lavoro del trasferimento di token ERC20](/img/edge/chainbridge/erc20-workflow.svg)
*es. Flusso di lavoro di un trasferimento di token ERC20*

</div>

## Tipi di account {#types-of-accounts}

Assicurati che gli account dispongano di token nativi sufficienti per creare transazioni prima di iniziare. In Polygon Edge, puoi assegnare saldi preminati agli account durante la generazione del blocco di genesi.

| **Tipo** | **Descrizione** |
|----------|-------------------------------------------------------------------------------------------------------------------------------|
| Amministratore | A questo account verrà assegnato per default il ruolo di amministratore. |
| Utente | L'account del mittente/destinatario che invia/riceve gli asset. L'account del mittente paga le gas fee quando approva i trasferimenti dei token e chiama il deposito nel contratto Bridge per avviare un trasferimento. |

:::info Il ruolo di amministratore
Alcune azioni possono essere eseguite solo dall'account del ruolo di amministratore. Di default, l'implementatore del contratto Bridge ha il ruolo di amministratore. Qui di seguito viene indicato come concedere il ruolo di amministratore a un altro account oppure rimuoverlo.

### Aggiungi il ruolo di amministratore {#add-admin-role}

Aggiunge un amministratore

```bash
# Grant admin role
$ cb-sol-cli admin add-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```
### Revoca il ruolo di amministratore {#revoke-admin-role}

Rimuove un amministratore

```bash
# Revoke admin role
$ cb-sol-cli admin remove-admin \
  --url [JSON_RPC_URL] \
  --privateKey [PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --admin "[NEW_ACCOUNT_ADDRESS]"
```

## Le operazioni consentite dall'account `admin` sono le seguenti. {#account-are-as-below}

### Impostare la risorsa {#set-resource}

Registrare un ID risorsa con un indirizzo di contratto per un handler.

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

### Rendere il contratto burnable/mintable (bruciabile/coniabile) {#make-contract-burnable-mintable}

Impostare un contratto token come mintable/burnable in un handler.

```bash
# Let contract burnable/mintable
$ cb-sol-cli bridge set-burn \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --handler "[HANDLER_CONTRACT_ADDRESS]" \
  --tokenContract "[TARGET_CONTRACT_ADDRESS]"
```

### Annullare la proposta {#cancel-proposal}

Annullare la proposta di esecuzione

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

### Sospendere/Riattivare {#pause-unpause}

Sospendere temporaneamente i depositi, la creazione delle proposte, le votazioni e l'esecuzione dei depositi.

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

### Modificare la commissione {#change-fee}

Modificare la commissione che verrà pagata al contratto Bridge

```bash
# Change fee for execution
$ cb-sol-cli admin set-fee \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --fee [FEE_IN_WEI]
```

### Aggiungere/Rimuovere un relayer {#add-remove-a-relayer}

Aggiungere un account come nuovo relayer o rimuovere un account dai relayer

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

### Modificare la soglia del relayer {#change-relayer-threshold}

Modificare il numero di voti richiesti per l'esecuzione di una proposta

```bash
# Remove relayer
$ cb-sol-cli admin set-threshold \
  --url [JSON_RPC_URL] \
  --privateKey [ADMIN_ACCOUNT_PRIVATE_KEY] \
  --bridge "[BRIDGE_CONTRACT_ADDRESS]" \
  --threshold [THRESHOLD]
```
:::

## ID della chain {#chain-id}

Il Chainbridge `chainId` è un valore arbitrario utilizzato nel bridge per operare una differenziazione tra le reti blockchain, e deve essere compreso nell'intervallo di uint8. Da non confondere con l'ID della chain della rete, non sono la stessa cosa. Questo valore deve essere univoco, ma non deve essere lo stesso dell'ID della rete.

In questo esempio, impostiamo  `99` in `chainId`, perché l'ID della chain della Mumbai testnet è `80001`, che non può essere rappresentato con un uint8.

## ID delle risorse {#resource-id}

Un ID di risorsa è un valore univoco di 32 byte in un ambiente cross-chain, associato a un certo asset (risorsa) che viene trasferito tra le reti.

L'ID di una risorsa è arbitrario, ma, come convenzione, di solito l'ultimo byte contiene l'ID della chain sorgente (la rete da cui proveniva questo asset).

## URL JSON-RPC per Polygon PoS {#json-rpc-url-for-polygon-pos}

Per questa guida utilizzeremo https://rpc-mumbai.matic.today, un URL JSON-RPC pubblico fornito da Polygon che può avere dei limiti di traffico o di rete. Questo URL verrà utilizzato solo per connettersi alla Polygon Mumbai testnet. Ti consigliamo di ottenere il tuo URL JSON-RPC da un servizio esterno come Infura perché l'implementazione dei contratti invierà molte query/richieste al JSON-RPC.

## Modalità di elaborazione del trasferimento di token {#ways-of-processing-the-transfer-of-tokens}
Durante il trasferimento tra le chain, i token ERC20 possono essere elaborati in due modalità diverse:

### Modalità di blocco/rilascio {#lock-release-mode}
<b>Chain di origine: </b>I token che stai inviando saranno bloccati nel contratto Handler.  <br/><b>Chain di destinazione:</b> La stessa quantità di token che hai inviato nella chain di origine verrà sbloccata e trasferita dal contratto Handler all'account del destinatario nella chain di destinazione.

### Modalità brucia/conia {#burn-mint-mode}
<b>Chain di origine:</b> I token che stai inviando verranno bruciati.   <br/> <b>Chain di destinazione:</b> La stessa quantità di token che hai inviato e bruciato nella chain di origine verrà coniata nella chain di destinazione e inviata all'account del destinatario.

Puoi utilizzare diverse modalità su ciascuna chain. Questo significa che puoi bloccare un token nella chain principale durante il mining di un token nella subchain per il trasferimento. Ad esempio, può avere senso bloccare/rilasciare i token se la fornitura totale o il programma di conio è controllato. Se il contratto nella subchain deve seguire la fornitura nella chain principale, i token verrebbero coniati/bruciati.

La modalità predefinita è la modalità blocco/rilascio. Se vuoi rendere i tuoi token mintable/burnable, devi chiamare il metodo `adminSetBurnable`. Se vuoi coniare i token all'esecuzione, dovrai concedere un ruolo `minter` al contratto Handler ERC20.


