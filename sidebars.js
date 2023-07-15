/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

module.exports = {

  delegate: [
    "delegate/delegate",
    "delegate/delegator-faq",
    "delegate/staking-faq",
  ],

 /*
 *
 * *********************** Apps & Tools Section *************************
 *
 * This section includes explainer guides and content on common wallets,
 * tools, applications, and services for the Polygon ecosystem.
 * 
 * **********************************************************************
 *
 */

  tools: [
    {
      type: "html",
      value: "Apps & Tools",
      className: "sidebar-title",
    },
    "tools/index",
    {
      type: "category",
      label: "Wallets",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/wallets/getting-started",
        {
          type: "category",
          label: "Polygon Wallet Suite",
          link: {
            type: "generated-index",
          },
          items: [
            "tools/wallets/polygon-web-wallet/web-wallet-v3-guide",
            "tools/wallets/adding-a-custom-token",
          ],
        },
        {
          type: "category",
          label: "Third-Party Apps",
          link: {
            type: "generated-index",
          },
          items: [
            {
              type: "category",
              label: "Metamask",
              link: {
                type: "generated-index",
              },
              items: [
                "tools/wallets/metamask/overview",
                "tools/wallets/metamask/hello",
                "tools/wallets/metamask/config-polygon-on-metamask",
                "tools/wallets/metamask/custom-tokens",
                "tools/wallets/metamask/multiple-accounts",
              ],
            },
            {
              type: "category",
              label: "Wallet Link",
              link: {
                type: "generated-index",
              },
              items: ["tools/wallets/metamask/config-polygon-on-wallet-link"],
            },

            {
              type: "category",
              label: "Venly",
              link: {
                type: "generated-index",
              },
              items: [
                "tools/wallets/venly/intro",
                "tools/wallets/venly/create-wallet",
                "tools/wallets/venly/network",
                "tools/wallets/venly/custom-tokens",
              ],
            },
            "tools/wallets/fortmatic",
            "tools/wallets/portis",
            "tools/wallets/torus",
            "tools/wallets/walletconnect",
            "tools/wallets/slashauth",
            "tools/wallets/plaid-wallet-onboard",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Faucets",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/faucets/matic-faucet",
        "tools/faucets/polygon-gas-station",
      ],
    },
    {
      type: "category",
      label: "Ethereum Tools",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/ethereum/remix",
        "tools/ethereum/truffle",
        "tools/ethereum/hardhat",
        "tools/ethereum/replit",
      ],
    },
    {
      type: "category",
      label: "Oracles",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/oracles/getting-started",
        "tools/oracles/api3",
        {
          type: "category",
          label: "Band Protocol",
          link: {
            type: "generated-index",
          },
          items: [
            "tools/oracles/bandchain",
            "tools/oracles/bandstandarddataset",
          ],
        },
        "tools/oracles/chainlink",
        "tools/oracles/optimisticoracle",
        "tools/oracles/razor",
        "tools/oracles/tellor",
        "tools/oracles/umb",
      ],
    },
    {
      type: "category",
      label: "Storage",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/storage/ipfs", 
        "tools/storage/filecoinhelpers",
        "tools/storage/crusthelpers", 
        "tools/storage/nftstorage",
        //"pos/develop/nftstorage",
      ]
    },
    {
      type: "category",
      label: "Data",
      link: {
        type: "generated-index",
      },
      items: [
        {
          type: "category",
          label: "The Graph",
          link: {
            type: "generated-index",
          },
          items: [
            "tools/data/the-graph/overview",
            "tools/data/the-graph/graph-data",
            "tools/data/the-graph/graph-entities",
            "tools/data/the-graph/graph-queries",
          ],
        },
        "tools/data/covalent",
        //"pos/develop/dapp-fauna-polygon-react",
      ],
    },
    {
      type: "category",
      label: "Frequently Asked Questions",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/faqs/wallet-bridge-faq",
      ],
    },
  ],

/*
 *
 * ************************* Governance Section *************************
 *
 * This section includes explainer guides and content on the PIP 
 * framework and PoS governance.
 * 
 * **********************************************************************
 *
 */

  govern: [
    {
      type: "html",
      value: "Polygon Governance",
      className: "sidebar-title",
    },
    "governance/index",
    {
      type: "category",
      label: "Polygon Improvement Proposals (PIPs)",
      link: {
        type: "generated-index",
      },
      items: [
        "governance/pips/pips-overview",
        "governance/pips/how-to-propose",
        "governance/pips/pips-forum",
        "governance/pips/pips-community-guidelines",
      ],
    },
    "governance/governance-pos",
  ],

/*
 *
 * ************************ PoS Mainnet Section *************************
 *
 * This section includes the official product documentation and
 * developer guides for Polygon PoS Mainnet.
 * 
 * **********************************************************************
 *
 */

  pos: [
    {
      type: "html",
      value: "Polygon PoS",
      className: "sidebar-title",
    },
    //"pos/index",
    "pos/getting-started",
    {
      type: "category",
      label: "System Design",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        "pos/polygon-architecture",
        "pos/design/gas-token",
        {
          type: "category",
          label: "Heimdall",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "pos/design/heimdall/overview",
            {
              type: "category",
              label: "Core Concepts",
              link: {
                type: "generated-index",
              },
              items: [
                "pos/design/heimdall/peppermint",
                "pos/design/heimdall/encoder",
                "pos/design/heimdall/transactions",
                "pos/design/heimdall/stdtx",
                "pos/design/heimdall/types",
                "pos/design/heimdall/validators",
                "pos/design/heimdall/checkpoint",
                "pos/design/heimdall/validator-key-management",
                "pos/design/heimdall/antehandler",
              ],
            },
            {
              type: "category",
              label: "Modules",
              link: {
                type: "generated-index",
              },
              items: [
                "pos/design/heimdall/modules/auth",
                "pos/design/heimdall/modules/bank",
                //"pos/design/heimdall/modules/asance",
                "pos/design/heimdall/modules/staking",
                "pos/design/heimdall/modules/checkpoint",
                "pos/design/heimdall/modules/bor",
                "pos/design/heimdall/modules/topup",
                "pos/design/heimdall/modules/clerk",
                "pos/design/heimdall/modules/chainmanager",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Bor",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "pos/design/bor/overview",
            "pos/design/bor/bor",
            "pos/design/bor/core_concepts",
            "pos/design/bor/consensus",
          ],
        },
        {
          type: "category",
          label: "Validators",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "pos/design/validator/architecture",
            "pos/design/validator/responsibilities",
            "pos/design/validator/core-components/staking",
            "maintain/polygon-basics/liquid-delegation",
            "pos/design/validator/rewards",
            {
              type: "category",
              label: "Core Components",
              link: {
                type: "generated-index",
              },
              items: [
                "pos/design/validator/core-components/heimdall-chain",
                "pos/design/validator/core-components/bor-chain",
                "pos/design/validator/core-components/checkpoint-mechanism",
                "pos/design/validator/core-components/key-management",
                "pos/design/validator/core-components/derivatives",
                "pos/design/validator/core-components/proposers-producers-selection",
                "pos/design/validator/core-components/proposer-bonus",
                "pos/design/validator/core-components/transaction-fees",
                "pos/design/validator/core-components/state-sync-mechanism",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Bridges",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "pos/design/bridge/ethereum-polygon/getting-started",
            "pos/design/bridge/ethereum-polygon/submit-mapping-request",
            {
              type: "category",
              label: "FxPortal",
              link: {
                type: "generated-index",
              },
              items: [
                "pos/design/bridge/l1-l2-communication/fx-portal",
                "pos/design/bridge/ethereum-polygon/mintable-assets",
                "pos/design/bridge/l1-l2-communication/state-transfer",
              ],
            },
            {
              type: "category",
              label: "State Sync",
              link: {
                type: "generated-index",
              },
              collapsed: true,
              items: [
                "pos/design/bridge/state-sync/state-sync",
                "pos/design/bridge/state-sync/how-state-sync-works",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "Transactions",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "pos/design/transactions/eip1559",
            {
              type: "category",
              label: "Account Abstraction",
              link: {
                type: "generated-index",
              },
              items: [
                "pos/design/transactions/meta-transactions/account-abstraction",
                "pos/design/transactions/meta-transactions/eip4337",
                "pos/design/transactions/meta-transactions/meta-transactions",
                "pos/design/transactions/meta-transactions/network-agnostics",
              ],
            },
          ],
        },
        "home/architecture/security-models",
      ],
    },
    {
      type: "category",
      label: "Deploy a Contract",
      link: {
        type: "generated-index",
      },
      items: [
        "pos/deploy/alchemy",
        "pos/deploy/chainide",
        "pos/deploy/chainstack",
        "pos/deploy/getblock",
        "pos/deploy/quicknode",
        "pos/deploy/thirdweb",
      ],
    },
    //"pos/develop/did-implementation",
    {
      type: "category",
      label: "Operate a Node",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        "pos/operate/validator/validator-node-system-requirements",
        "pos/operate/node/full-node-deployment",
        "pos/operate/node/archive-node",
        {
          type: "category",
          label: "Run a Validator Node",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "pos/operate/validator/kb/how-to",
            "pos/operate/validator/run-validator",
            {
              type: "category",
              label: "Validator Staking",
              link: {
                type: "generated-index",
              },
              items: [
                "pos/operate/validator/validator-staking-operations",
                "pos/operate/validator/validator-commission-operations",
              ],
            },
            {
              type: "category",
              label: "Validator Issues",
              link: {
                type: "generated-index",
              },
              items: [
                "pos/operate/validator/kb/known-issues",
                "pos/operate/validator/issues/reporting-issues",
              ],
            },
            "pos/operate/validator/validator-performance-overview",
            //"maintain/glossary",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Reference",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        "pos/reference/commit-chain-multisigs",
        "pos/reference/mapped-tokens",
        "pos/reference/rpc-endpoints",
        "pos/reference/default-ports",
        "pos/reference/snapshot-instructions-heimdall-bor",
        {
          type: "category",
          label: "Core Contracts",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "pos/reference/contracts/genesis-contracts",
            "pos/reference/contracts/stakingmanager",
            "pos/reference/contracts/delegation",
          ],
        },
      ],
    },
    "pos/pos-faqs",
  ],

/*
 *
 * *************************** Matic.js Section *************************
 *
 * This section includes the official product documentation and 
 * reference material for Matic.JS.
 * 
 * **********************************************************************
 *
 */

  maticjs: [
    {
      type: "html",
      value: "MaticJS SDK",
      className: "sidebar-title",
    },
    "tools/matic-js/get-started",
    "tools/matic-js/api-architecture",
    "tools/matic-js/installation",
    {
      type: "category",
      label: "Setup",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/matic-js/setup/index",
        "tools/matic-js/setup/web3",
        "tools/matic-js/setup/ethers",
      ],
    },
    {
      type: "category",
      label: "PoS Network",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/matic-js/pos/index",
        {
          type: "category",
          label: "ERC20",
          link: {
            type: "generated-index",
          },
          items: [
            "tools/matic-js/pos/erc20/index",
            "tools/matic-js/pos/erc20/get-balance",
            "tools/matic-js/pos/erc20/approve",
            "tools/matic-js/pos/erc20/approve-max",
            "tools/matic-js/pos/erc20/get-allowance",
            "tools/matic-js/pos/erc20/deposit",
            "tools/matic-js/pos/erc20/transfer",
            "tools/matic-js/pos/erc20/withdraw-start",
            "tools/matic-js/pos/erc20/withdraw-exit",
            "tools/matic-js/pos/erc20/withdraw-exit-faster",
            "tools/matic-js/pos/erc20/is-withdraw-exited",
          ],
        },
        {
          type: "category",
          label: "ERC721",
          link: {
            type: "generated-index",
          },
          items: [
            "tools/matic-js/pos/erc721/index",
            "tools/matic-js/pos/erc721/get-tokens-count",
            "tools/matic-js/pos/erc721/get-token-id-at-index-for-user",
            "tools/matic-js/pos/erc721/get-all-tokens",
            "tools/matic-js/pos/erc721/is-approved",
            "tools/matic-js/pos/erc721/is-approved-all",
            "tools/matic-js/pos/erc721/approve",
            "tools/matic-js/pos/erc721/approve-all",
            "tools/matic-js/pos/erc721/deposit",
            "tools/matic-js/pos/erc721/deposit-many",
            "tools/matic-js/pos/erc721/withdraw-start",
            "tools/matic-js/pos/erc721/withdraw-start-many",
            "tools/matic-js/pos/erc721/withdraw-exit",
            "tools/matic-js/pos/erc721/withdraw-exit-many",
            "tools/matic-js/pos/erc721/withdraw-exit-faster",
            "tools/matic-js/pos/erc721/withdraw-exit-faster-many",
            "tools/matic-js/pos/erc721/is-withdraw-exited",
            "tools/matic-js/pos/erc721/is-withdraw-exited-many",
            "tools/matic-js/pos/erc721/transfer",
            "tools/matic-js/pos/erc721/withdraw-start-with-meta-data",
          ],
        },
        {
          type: "category",
          label: "ERC1155",
          link: {
            type: "generated-index",
          },
          items: [
            "tools/matic-js/pos/erc1155/get-balance",
            "tools/matic-js/pos/erc1155/approve-all",
            "tools/matic-js/pos/erc1155/approve-all-for-mintable",
            "tools/matic-js/pos/erc1155/is-approved-all",
            "tools/matic-js/pos/erc1155/deposit",
            "tools/matic-js/pos/erc1155/deposit-many",
            "tools/matic-js/pos/erc1155/withdraw-start",
            "tools/matic-js/pos/erc1155/withdraw-start-many",
            "tools/matic-js/pos/erc1155/withdraw-exit",
            "tools/matic-js/pos/erc1155/withdraw-exit-faster",
            "tools/matic-js/pos/erc1155/withdraw-exit-many",
            "tools/matic-js/pos/erc1155/withdraw-exit-faster-many",
            "tools/matic-js/pos/erc1155/is-withdraw-exited",
            "tools/matic-js/pos/erc1155/is-withdraw-exited-many",
            "tools/matic-js/pos/erc1155/transfer",
          ],
        },
        "tools/matic-js/pos/is-check-pointed",
        "tools/matic-js/pos/is-deposited",
        "tools/matic-js/pos/deposit-ether",
      ],
    },
    "tools/matic-js/fx-portal",
    "tools/matic-js/set-proof-api",
    {
      type: "category",
      label: "Advanced",
      link: {
        type: "generated-index",
      },
      items: [
        "tools/matic-js/advanced/abi-manager",
        "tools/matic-js/advanced/plugin",
        "tools/matic-js/advanced/exit-util",
      ],
    },
  ],

  contribute: [
    "contribute/contributor-guidelines",
    "contribute/bug-bounty-program",
    "contribute/wiki-maintainers",
    {
      type: "category",
      label: "Style Guide",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: ["contribute/writing-style", "contribute/tutorial-template"],
    },
    "contribute/translate",
  ],

/*
 *
 * *************************** Miden Section ****************************
 *
 * This section includes the official product documentation and
 * developer guides for Polygon Miden.
 * 
 * **********************************************************************
 *
 */

  miden: [
    {
      type: "html",
      value: "Polygon Miden",
      className: "sidebar-title",
    },
    "miden/index",
    "miden/intro/main",
    "miden/intro/architecture",
    "miden/user_docs/usage",
    {
      type: "category",
      label: "Reference",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Miden Assembly Language",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "miden/user_docs/assembly/main",
            "miden/user_docs/assembly/code_organization",
            "miden/user_docs/assembly/flow_control",
            "miden/user_docs/assembly/field_operations",
            "miden/user_docs/assembly/u32_operations",
            "miden/user_docs/assembly/stack_manipulation",
            "miden/user_docs/assembly/io_operations",
            "miden/user_docs/assembly/cryptographic_operations",
            "miden/user_docs/assembly/execution-context",
          ],
        },
        {
          type: "category",
          label: "Miden Standard Library",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "miden/user_docs/stdlib/main",
            "miden/user_docs/stdlib/crypto/hashes",
            "miden/user_docs/stdlib/crypto/fri",
            "miden/user_docs/stdlib/math/u64",
            "miden/user_docs/stdlib/sys",
            "miden/user_docs/stdlib/mem",
          ],
        },
        "miden/intro/performance",
      ],
    },
  ],

/*
 *
 * ************************** Supernets Section *************************
 *
 * This section includes the official product documentation and
 * developer guides for Polygon Supernets.
 * 
 * **********************************************************************
 *
 */

  supernets: [
    {
      type: "html",
      value: "Polygon Supernets",
      className: "sidebar-title",
    },
    "supernets/index",
    "supernets/operate/supernets-quick-start",
    "supernets/get-started/what-are-supernets",
    {
      type: "category",
      label: "System Design",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        "supernets/design/overview",
        {
          type: "category",
          label: "Consensus",
          link: {
            type: "generated-index",
          },
          items: [
            "supernets/design/consensus/polybft/polybft-overview",
            "supernets/design/consensus/polybft/ibft-overview",
          ],
        },
        {
          type: "category",
          label: "Bridge",
          link: {
            type: "generated-index",
          },
          items: [
            "supernets/design/bridge/overview",
            "supernets/design/bridge/statesync",
            "supernets/design/bridge/checkpoint",
            {
              type: "category",
              label: "Assets",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/design/bridge/assets/erc/erc20",
                "supernets/design/bridge/assets/erc/erc721",
                "supernets/design/bridge/assets/erc/erc1155",
              ],
            },
          ],
        },
        "supernets/design/supernets-libp2p",
        {
          type: "category",
          label: "Runtime",
          link: {
            type: "generated-index",
          },
          items: [
            "supernets/design/runtime/supernets-runtime",
            "supernets/design/runtime/supernets-runtime-allowlist",
          ],
        },
        "supernets/design/supernets-blockchain",
        "supernets/design/supernets-mempool",
        "supernets/design/supernets-txpool",
        "supernets/design/supernets-txrelayer",
        "supernets/design/supernets-json-rpc",
        "supernets/design/supernets-grpc",
      ],
    },
    {
      type: "category",
      label: "Build a Supernet",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Prepare Your Environment",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
              "supernets/operate/supernets-requirements",
              "supernets/operate/supernets-install",
            ],
        },
        "supernets/operate/supernets-ibft-to-polybft",
        {
          type: "category",
          label: "Deploy a Supernet",
          link: {
            type: "generated-index",
          },
          items: [
            "supernets/operate/deploy/supernets-deploy-index",
            "supernets/operate/deploy/supernets-spawn-test-chain",
            "supernets/operate/deploy/supernets-how-to-generate-genesis",
            "supernets/operate/deploy/supernets-how-to-configure-rootchain",
            "supernets/operate/deploy/supernets-genesis-validators",
            "supernets/operate/deploy/supernets-how-to-start",
          ],
        },
        {
          type: "category",
          label: "Operate Your Supernet",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            {
              type: "category",
              label: "Access Control",
              link: {
                type: "generated-index",
              },
              collapsed: true,
              items: [
                  "supernets/operate/deploy/access-control/supernets-allowlist-add-remove",
                ],
            },
            {
              type: "category",
              label: "Staking",
              link: {
                type: "generated-index",
              },
              collapsed: true,
              items: [
                  "supernets/operate/deploy/staking/supernets-how-to-stake",
                  "supernets/operate/deploy/staking/supernets-unstake",
                ],
            },
            {
              type: "category",
              label: "Transfers",
              link: {
                type: "generated-index",
              },
              collapsed: true,
              items: [
                  "supernets/operate/deploy/transfers/supernets-cross-chain-deposit",
                  "supernets/operate/deploy/transfers/supernets-cross-chain-withdraw",
                ],
            },
            "supernets/operate/deploy/supernets-how-to-upgrade",
            ],
        },
        ],
    },
    {
      type: "category",
      label: "Reference",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        "supernets/operate/supernets-param-reference",
        {
          type: "category",
          label: "Smart Contract Interfaces",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            {
              type: "category",
              label: "ERC-20",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/interfaces/erc20/native-erc20",
                "supernets/interfaces/erc20/childerc20",
                "supernets/interfaces/erc20/childerc20-predicate",
                "supernets/interfaces/erc20/rooterc20-predicate",
              ],
            },
            {
              type: "category",
              label: "ERC-721",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/interfaces/erc721/childerc721",
                "supernets/interfaces/erc721/childerc721-predicate",
                "supernets/interfaces/erc721/rooterc721-predicate",
              ],
            },
            {
              type: "category",
              label: "ERC-1155",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/interfaces/erc1155/childerc1155",
                "supernets/interfaces/erc1155/childerc1155-predicate",
                "supernets/interfaces/erc1155/rooterc1155-predicate",
              ],
            },
            "supernets/interfaces/eip1559-interface",
            {
              type: "category",
              label: "Network",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/interfaces/network/checkpoint-manager",
                "supernets/interfaces/network/exit-helper",
                "supernets/interfaces/network/state-receiver",
                "supernets/interfaces/network/state-sender",
              ],
            },
            {
              type: "category",
              label: "Validators",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/interfaces/validators/validator",
                "supernets/interfaces/validators/validator-set-base",
                "supernets/interfaces/validators/root-validator-set",
              ],
            },
            {
              type: "category",
              label: "Staking",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/interfaces/staking/stake-manager-interface",
                "supernets/interfaces/staking/supernet-manager-interface",
                "supernets/interfaces/staking/custom-supernet-manager-interface",
              ],
            },
            {
              type: "category",
              label: "Cryptography",
              link: {
                type: "generated-index",
              },
              items: [
                "supernets/interfaces/cryptography/bls",
                "supernets/interfaces/cryptography/bn256g2",
              ],
            },
          ],
        },
        {
          type: "category",
          label: "RPC API Reference",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "supernets/api/json-rpc-eth",
            "supernets/api/json-rpc-net",
            "supernets/api/json-rpc-web3",
            "supernets/api/json-rpc-txpool",
            "supernets/api/json-rpc-debug",
            "supernets/api/json-rpc-bridge",
          ],
        },
        "supernets/operate/supernets-performance",
      ],
    },
    "supernets/supernets-faq",
  ],

 /*
 *
 * ***************************** Specs Section **************************
 *
 * This section includes specifications, reference material, academia,
 * and research-grade material related to the Polygon stack.
 * 
 * **********************************************************************
 *
 */

  miden_specs: [
    //"specs/index",
    {
      type: "category",
      label: "Miden VM",
      link: {
        type: "generated-index",
      },
      collapsed: true,
      items: [
        {
          type: "category",
          label: "Stack Specifications",
          link: {
            type: "generated-index",
          },
          collapsed: true,
          items: [
            "miden/design/main",
            "miden/design/programs",
            {
              type: "category",
              label: "Program decoder",
              link: {
                type: "generated-index",
              },
              items: [
                "miden/design/decoder/main",
                "miden/design/decoder/constraints",
              ],
            },
            {
              type: "category",
              label: "Operand stack",
              link: {
                type: "generated-index",
              },
              items: [
                "miden/design/stack/main",
                "miden/design/stack/op_constraints",
                "miden/design/stack/system_ops",
                "miden/design/stack/field_ops",
                "miden/design/stack/u32_ops",
                "miden/design/stack/stack_ops",
                "miden/design/stack/io_ops",
                "miden/design/stack/crypto_ops",
              ],
            },
            "miden/design/range",
            {
              type: "category",
              label: "Chiplets",
              link: {
                type: "generated-index",
              },
              items: [
                "miden/design/chiplets/main",
                "miden/design/chiplets/hasher",
                "miden/design/chiplets/bitwise",
                "miden/design/chiplets/memory",
              ],
            },
            "miden/design/multiset",
          ],
        },
        "miden/resources",
      ],
    },
  ],
};
