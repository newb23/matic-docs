---
id: storage
title: Armazenamento
description: Explicação sobre o módulo Armazenamento do Polygon Edge.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## Visão geral {#overview}

Atualmente, o Polygon Edge utiliza o **LevelDB** para armazenamento de dados e também para armazenar dados **na memória**.

Em todo o Polygon Edge, quando os módulos precisam interagir com o armazenamento de dados subjacente,
eles não precisam saber com que mecanismo ou serviço de base de dados estão a falar.

A camada de base de dados é eliminada de um módulo chamado **Armazenamento**, que exporta as interfaces que os módulos consultam.

Cada camada da base de dados, agora apenas **LevelDB**, implementa estes métodos separadamente, garantindo que eles se encaixem na implementação.

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

### Prefixos {#prefixes}

Para tornar a consulta ao armazenamento no LevelDB determinista e evitar conflitos de armazenamento de chaves, o Polygon Edge utiliza
prefixos e subprefixos ao armazenar dados

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

## Planos futuros {#future-plans}

Os planos para o futuro próximo incluem acrescentar algumas das soluções de base de dados mais populares, tais como:
* PostgreSQL
* MySQL


## 📜 Recursos {#resources}
* **[LevelDB](https://github.com/google/leveldb)**