---
id: storage
title: स्टॉरिज
description: पॉलीगॉन एज के स्टोरेज मॉड्यूल के लिए स्पष्टीकरण.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - storage
  - LevelDB
---

## अवलोकन {#overview}

पॉलीगॉन एज वर्तमान में डेटा स्टोरेज के लिए **लेवल डीबी** का इस्तेमाल करता है, साथ ही **ईन इन मेमोरी**डेटा स्टोर भी उपलब्ध है.

पॉलीगॉन एज के दौरान, जब मॉड्यूल डेटा स्टोर के साथ इंटरैक्ट करें, उन्हें यह जानने की आवश्यकता नहीं है कि वे किस DB इंजन या सेवा से बात कर रहे हैं.

डीबी लेयर को **स्टोरेज**नामक मॉड्यूल के बीच अलग कर दिया जाता है, जो उस मॉड्यूल क्वेरी को इंटरफेस निर्यात करता है.

प्रत्येक DB लेयर, अभी के लिए केवल **LevelDB**, इन विधियों को अलग से लागू करती है, यह सुनिश्चित करते हुए कि वे उनके लागू करना के साथ फिट हैं.

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

### उपसर्गों {#prefixes}

LevelDB स्टोरेज को निर्धारित करने वाली क्वेरी करने के लिए, और की स्टोरेज क्लैशिंग से बचने के लिए, पॉलीगॉन एज लीवरेज करता है डेटा संग्रहीत करते समय उपसर्ग और उप-उपसर्ग

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

## भविष्य की योजना {#future-plans}

निकट भविष्य के लिए योजनाओं में कुछ सबसे लोकप्रिय डीबी सॉल्यूशंस शामिल हैं, जैसे:
* PostgreSQL
* MySQL


## 📜 संसाधन {#resources}
* **[LevelDB](https://github.com/google/leveldb)**