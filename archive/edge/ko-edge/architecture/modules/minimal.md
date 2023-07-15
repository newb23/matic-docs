---
id: minimal
title: 최소한의 모듈
description: Polygon 엣지의 최소한의 모듈에 대한 설명.
keywords:
  - docs
  - polygon
  - edge
  - architecture
  - module
  - minimal
---

## 개요 {#overview}

앞서 언급했듯이, Polygon 엣지는 일련의 다양한 모듈로 구성되어 있으며 이 모듈은 서로 연결되어 있습니다.<br />
**블록체인**은 **상태**나 **동기화**(새 블록을 **블록체인**으로 연결) 등과 연결되어 있습니다.

**최소한의 모듈**은 이렇게 상호 연결된 모듈의 초석이라 할 수 있으며, <br />
Polygon 엣지에서 실행되는 모든 서비스의 중심 허브 역할을 합니다.

## 스타트업 매직 {#startup-magic}

무엇보다도 최소한의 모듈은 다음을 책임집니다.
* 데이터 디렉터리 설정
* libp2p 통신을 위한 키스토어 생성
* 스토리지 생성
* 합의 설정
* GRPC, JSON RPC, 동기화를 통한 블록체인 객체 설정

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
