---
id: minimal
title: मिनिमल
description: पॉलीगॉन एज के मिनिमल मॉड्यूल के लिए स्पष्टीकरण.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - minimal
---

## ओवरव्यू {#overview}

जैसा कि पहले बताया गया है, पॉलीगॉन एज विभिन्न मॉड्यूल का सेट होता है जो सभी एक दूसरे से जुड़े होते हैं.<br />
**ब्लॉकचेन** **स्टेट** से जुड़ा होता है, या उदाहरण के लिए, **सिंक्रनाइज़ेशन** जो **ब्लॉकचेन** में नए ब्लॉक को पाइप करता है.

**मिनिमल** इन इंटर-कनेक्टेड मॉड्यूल के लिए कॉर्नरस्टोन होता है.<br />
यह पॉलीगॉन एज पर रन करने वाली सभी सेवाओं के लिए एक सेंट्रल हब के रूप में काम करता है.

## स्टार्टअप मैजिक {#startup-magic}

अन्य बातों के अलावा, मिनिमल इसके लिए जिम्मेदार है:
* डेटा डायरेक्टरी सेट अप करने के लिए
* libp2p कम्युनिकेशन के लिए कीस्टोर बनाने के लिए
* स्टोरेज बनाने के लिए
* सहमति सेट करने के लिए
* GRPC, JSON RPC, और सिंक्रनाइज़ेशन के साथ ब्लॉकचेन ऑब्जेक्ट सेट अप करने के लिए

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
