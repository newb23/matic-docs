---
id: validators
title: Domande frequenti sui validatori
description: "Domande frequenti sui validatori di Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Come aggiungere/rimuovere un validatore? {#how-to-add-remove-a-validator}

### Poa {#poa}
L'aggiunta/rimozione dei validatori viene effettuata votando. [Qui](/docs/edge/consensus/poa) puoi trovare una guida completa sull'argomento.

### PoS {#pos}
[Qui](/docs/edge/consensus/pos-stake-unstake) puoi trovare una guida su come fare lo staking di fondi, in modo che un nodo possa diventare un validatore, e su come annullare lo staking (rimuovere il validatore).

Nota che:
- Puoi utilizzare il flag di genesi `--max-validator-count` per impostare un numero massimo di staker che possono unirsi al set di validatori.
- Puoi utilizzare il flag  della genesi `--min-validator-count ` per impostare il numero minimo di staker necessari per unirsi al set di validatori (`1` di default).
- Quando viene raggiunto il numero massimo di validatori, non puoi aggiungere un altro validatore fino a quando non ne rimuovi uno esistente dal set (non importa se l'importo messo in staking del nuovo è più alto). Se rimuovi un validatore, il numero di validatori rimanenti non può essere inferiore a `--min-validator-count`.
- Esiste una soglia predefinita di `1`  unità di valuta della rete (gas) nativa per diventare un validatore.



## Quanto spazio su disco è consigliato per un validatore? {#how-much-disk-space-is-recommended-for-a-validator}

Consigliamo di iniziare con 100G come pista stimata in modo prudente, e di assicurarsi che sia possibile ridimensionare il disco in seguito.


## Esiste un limite al numero di validatori? {#is-there-a-limit-to-the-number-of-validators}

Se parliamo di limitazioni tecniche, Polygon Edge non ha esplicitamente un limite al numero di nodi che puoi avere in una rete. Puoi impostare i limiti di connessione (conteggi di connessioni in entrata/in uscita) su base per nodo.

Se parliamo di limitazioni pratiche, vedrai una performance più degradata con un cluster di 100 nodi rispetto a un cluster di 10 nodi: Aumentando il numero di nodi nel tuo cluster, aumenti la complessità delle comunicazioni e solo il sovraccarico di rete in generale. Tutto dipende dal tipo di rete in esecuzione, e dal tipo di topologia di rete che hai.

## Come passare da PoA a PoS? {#how-to-switch-from-poa-to-pos}

PoA è il meccanismo di consensus predefinito. Nel caso di un nuovo cluster, per passare a PoS, dovrai aggiungere il flag `--pos` quando generi il file di genesi. Se hai un cluster in esecuzione, puoi trovare [qui](/docs/edge/consensus/migration-to-pos) come effettuare il passaggio. Tutte le informazioni di cui hai bisogno sui nostri meccanismi di consensus e sulla configurazione sono disponibili nella nostra [sezione sul consensus](/docs/edge/consensus/poa).

## Come faccio ad aggiornare i miei nodi quando c'è una modifica sostanziale?  {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

[Qui](/docs/edge/validator-hosting#update) puoi trovare una guida dettagliata su come eseguire questa procedura.

## L'importo di staking minimo è configurabile per PoS Edge? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

Di default l'importo di staking minimo è `1 ETH`, e non è configurabile.

## Perché i comandi JSON RPC `eth_getBlockByNumber` e `eth_getBlockByHash` non restituiscono l'indirizzo del minatore? {#not-return-the-miner-s-address}

Il consensus utilizzato attualmente in Polygon Edge è IBFT 2.0, che, a sua volta, si basa sul meccanismo di voto spiegato in Clique PoA: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).

Guardando all'EIP-225 (Clique PoA), questa è la parte rilevante che spiega per cosa viene utilizzato `miner` (alias `beneficiary`):

<blockquote>Riutilizziamo i campi di intestazione ethash come segue:<ul>
<li><b>beneficiario / minatore: </b> Indirizzo a cui proporre la modifica dell'elenco dei firmatari autorizzati.</li>
<ul>
<li>Deve essere riempito normalmente con degli zeri, modificato solo durante la votazione.</li>
<li>Tuttavia i valori arbitrari sono consentiti (anche quelli senza senso, come la votazione dei non firmatari) per evitare una complessità extra nelle implementazioni intorno alla meccanica di voto.</li>
<li>Deve essere riempito con degli zeri sui blocchi di checkpoint (cioè transizione di epoca).</li>
</ul>

</ul>

</blockquote>

Così, il campo `miner` viene utilizzato per proporre un voto per un indirizzo specifico, non per mostrare il proponente del blocco.

Le informazioni sul proponente del blocco possono essere trovate recuperando la pubkey dal campo Seal del campo dati extra Istanbul codificato RLP nelle intestazioni del blocco.

## Quali parti e valori di Genesis possono essere modificate in modo sicuro? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Assicurati di creare una copia manuale del file genesis.json esistente prima di tentare di modificarlo. Inoltre, l'intera catena deve essere fermata prima di modificare il file genesis.json. Una volta che il file di genesis viene modificato, la nuova versione di esso deve distribuire in tutti i nodi non validatore e valdiator

:::

**Solo la sezione degli bootnodes del file genesis può essere modificata in modo sicuro**, dove è possibile aggiungere o rimuovere gli bootnodes dall'elenco.