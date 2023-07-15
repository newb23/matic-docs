---
id: minimal
title: মিনিমাল
description: Polygon Edge-এর মিনিমাল মডিউলের ব্যাখ্যা।
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - minimal
---

## সংক্ষিপ্ত বিবরণ {#overview}

আগেই উল্লেখ করা হয়েছে যে Polygon Edge হচ্ছে বিভিন্ন মডিউলের একটি সেট, যেগুলো সব একে অপরের সাথে সংযুক্ত।<br />
উদাহরণস্বরূপ, **ব্লকচেইন** **স্টেট** অথবা **সিঙ্ক্রোনাইজেশন**-এর সাথে সংযুক্ত এবং এগুলো **ব্লকচেইনে** নতুন ব্লক পাইপ করে।

**মিনিমাল** হচ্ছে এই আন্তঃসংযুক্ত মডিউলের মূল ভিত্তি। <br />
এটি Polygon Edge-এ পরিচালিত সকল পরিষেবার কেন্দ্রীয় হাব হিসেবে কাজ করে।

## স্টার্টআপ ম্যাজিক {#startup-magic}

সেইসব কাজ ছাড়াও মিনিমাল নিম্নোক্ত কাজগুলো সম্পাদন করে থাকে:
* ডেটা ডিরেক্টরি সেট আপ করা
* libp2p কমিউনিকেশনের জন্য একটি কীস্টোর তৈরি করা
* স্টোরেজ
* কনসেনসাস সেটআপ করা
* GRPC, JSON RPC এবং সিঙ্ক্রোনাইজেশন দিয়ে ব্লকচেইন অবজেক্ট সেটআপ করা

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
