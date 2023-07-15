---
id: minimal
title: Minimal
description: Polygon Edge'in minimal modülüne ilişkin açıklama.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - minimal
---

## Genel Bakış {#overview}

Daha önce de belirtildiği üzere, Polygon Edge, hepsi birbirine bağlı olan farklı modüller kümesidir.<br />
**Blok Zinciri**, **Duruma** veya örneğin, **Blok Zincirine** yeni blokları bağlayan **Senkronizasyona** bağlıdır.

**Minimal**, birbirine bağlı bu modüllerin önemli unsurlarından biridir. <br />
Polygon Edge üzerinde çalışan tüm hizmetler için merkezî bir dağıtıcı görevi görür.

## Başlangıç Büyüsü {#startup-magic}

Diğer şeylerin yanı sıra, Minimal aşağıdakilerden sorumludur:
* Veri dizinlerini kurma
* libp2p iletişimi için bir keystore oluşturma
* Depolama alanı oluşturma
* Konsensüs oluşturma
* GRPC, JSON RPC ve Senkronizasyon ile blok zinciri nesnesini kurma

````go title="minimal/server.go"
func NewServer(logger hclog.Logger, config *Config) (*Server, error) {
	m := &Server{
		logger: logger,
		config: config,
		chain:      config.Chain,
		grpcServer: grpc.NewServer(),
	}

	m.logger.Info("Data dir", "path", config.DataDir)

	// Generate all the paths in the dataDir
	if err := setupDataDir(config.DataDir, dirPaths); err != nil {
		return nil, fmt.Errorf("failed to create data directories: %v", err)
	}

	// Get the private key for the node
	keystore := keystore.NewLocalKeystore(filepath.Join(config.DataDir, "keystore"))
	key, err := keystore.Get()
	if err != nil {
		return nil, fmt.Errorf("failed to read private key: %v", err)
	}
	m.key = key

	storage, err := leveldb.NewLevelDBStorage(filepath.Join(config.DataDir, "blockchain"), logger)
	if err != nil {
		return nil, err
	}
	m.storage = storage

	// Setup consensus
	if err := m.setupConsensus(); err != nil {
		return nil, err
	}

	stateStorage, err := itrie.NewLevelDBStorage(filepath.Join(m.config.DataDir, "trie"), logger)
	if err != nil {
		return nil, err
	}

	st := itrie.NewState(stateStorage)
	m.state = st

	executor := state.NewExecutor(config.Chain.Params, st)
	executor.SetRuntime(precompiled.NewPrecompiled())
	executor.SetRuntime(evm.NewEVM())

	// Blockchain object
	m.blockchain, err = blockchain.NewBlockchain(logger, storage, config.Chain, m.consensus, executor)
	if err != nil {
		return nil, err
	}

	executor.GetHash = m.blockchain.GetHashHelper

	// Setup sealer
	sealerConfig := &sealer.Config{
		Coinbase: crypto.PubKeyToAddress(&m.key.PublicKey),
	}
	m.Sealer = sealer.NewSealer(sealerConfig, logger, m.blockchain, m.consensus, executor)
	m.Sealer.SetEnabled(m.config.Seal)

	// Setup the libp2p server
	if err := m.setupLibP2P(); err != nil {
		return nil, err
	}

	// Setup the GRPC server
	if err := m.setupGRPC(); err != nil {
		return nil, err
	}

	// Setup jsonrpc
	if err := m.setupJSONRPC(); err != nil {
		return nil, err
	}

	// Setup the syncer protocol
	m.syncer = protocol.NewSyncer(logger, m.blockchain)
	m.syncer.Register(m.libp2pServer.GetGRPCServer())
	m.syncer.Start()

	// Register the libp2p GRPC endpoints
	proto.RegisterHandshakeServer(m.libp2pServer.GetGRPCServer(), &handshakeService{s: m})

	m.libp2pServer.Serve()
	return m, nil
}
````
