---
id: storage
title: Stockage
description: Explication pour le module de stockage de Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Aperçu {#overview}

Polygon Edge utilise actuellement **LevelDB**  données stockage ainsi qu'un magasin données **en mémoire**.

Tout au long du Polygon Edge quand les modules doivent interagir avec le stockage données sous-jacent, ils n'ont pas besoin de savoir à quel moteur DB ou service ils parlent.

La couche DB est abstraite entre un module appelé **Stockage**, qui exporte des interfaces que les modules interrogent.

Chaque couche de base de données, pour l'instant uniquement avec **LevelDB**, implémente ces méthodes séparément, en s'assurant qu'elles s'intègrent à leur implémentation.

````go title="blockchain/storage/storage.go"
// Storage is a generic blockchain storage
type Storage interface {
	ReadCanonicalHash(n uint64) (types.Hash, bool)
	WriteCanonicalHash(n uint64, hash types.Hash) error

	ReadHeadHash() (types.Hash, bool)
	ReadHeadNumber() (uint64, bool)
	WriteHeadHash(h types.Hash) error
	WriteHeadNumber(uint64) error

	WriteForks(forks []types.Hash) error
	ReadForks() ([]types.Hash, error)

	WriteDiff(hash types.Hash, diff *big.Int) error
	ReadDiff(hash types.Hash) (*big.Int, bool)

	WriteHeader(h *types.Header) error
	ReadHeader(hash types.Hash) (*types.Header, error)

	WriteCanonicalHeader(h *types.Header, diff *big.Int) error

	WriteBody(hash types.Hash, body *types.Body) error
	ReadBody(hash types.Hash) (*types.Body, error)

	WriteSnapshot(hash types.Hash, blob []byte) error
	ReadSnapshot(hash types.Hash) ([]byte, bool)

	WriteReceipts(hash types.Hash, receipts []*types.Receipt) error
	ReadReceipts(hash types.Hash) ([]*types.Receipt, error)

	WriteTxLookup(hash types.Hash, blockHash types.Hash) error
	ReadTxLookup(hash types.Hash) (types.Hash, bool)

	Close() error
}
````

## LevelDB {#leveldb}

### Préfixes {#prefixes}

Afin de rendre l'interrogation du stockage LevelDB déterministe, et d'éviter les conflits de stockage des clés, le Polygon Edge exploite les éléments suivants
 les préfixes et les sous-préfixes lors du stockage des données

````go title="blockchain/storage/keyvalue.go"
// Prefixes for the key-value store
var (
	// DIFFICULTY is the difficulty prefix
	DIFFICULTY = []byte("d")

	// HEADER is the header prefix
	HEADER = []byte("h")

	// HEAD is the chain head prefix
	HEAD = []byte("o")

	// FORK is the entry to store forks
	FORK = []byte("f")

	// CANONICAL is the prefix for the canonical chain numbers
	CANONICAL = []byte("c")

	// BODY is the prefix for bodies
	BODY = []byte("b")

	// RECEIPTS is the prefix for receipts
	RECEIPTS = []byte("r")

	// SNAPSHOTS is the prefix for snapshots
	SNAPSHOTS = []byte("s")

	// TX_LOOKUP_PREFIX is the prefix for transaction lookups
	TX_LOOKUP_PREFIX = []byte("l")
)

// Sub-prefixes
var (
	HASH   = []byte("hash")
	NUMBER = []byte("number")
	EMPTY  = []byte("empty")
)
````

## Plans Futurs {#future-plans}

Dans un avenir proche, il est prévu d'ajouter certaines des solutions les plus populaires de DB, telles que:
* PostgreSQL
* MySQL


## 📜 Ressources {#resources}
* **[LevelDB](https://github.com/google/leveldb)**