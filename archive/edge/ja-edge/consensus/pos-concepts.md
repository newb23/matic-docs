---
id: pos-concepts
title: プルーフ・オブ・ステーク（PoS）
description: "プルーフ・オブ・ステーク（PoS）に関する説明とインストラクション。"
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## 概要 {#overview}

このセクションではプルーフ・オブ・ステーク（PoS）で現在存在しているいくつかの概念のより優れた概要を提供することを目的にしています。Polygon Edgeの実装

Polygon Edgeのプルーフ・オブ・ステーク（PoS）の実装は既存のPoA IBFT実装の代替となることを意図しており、ノードオペレータにチェーンを開始する際にこの2つから容易に選択する能力を提供します。

## PoS機能 {#pos-features}

プルーフ・オブ・ステークの実装の背後にあるコアロジックは、**[ステーキングスマートコントラクト。](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**

このコントラクトはPoSメカニズムPolygon Edgeチェーンが初期化されるたびにプリデプロイされ、アドレス`0x0000000000000000000000000000000000001001`で
ブロック`0`から使用可能です。

### エポック {#epochs}

エポックはPolygon EdgeにPoSが追加されるとともに導入された概念です。

エポックはあるバリデータセットがブロックを生成できる特別のタイムフレーム（ブロック）とみなされます。その長さは変更可能であり、つまりノードオペレータがジェネシス生成中にエポックの長さを設定できるということです。

各エポックの末尾に、_エポックブロック_が作成され、そのイベント後に新しいエポックが開始されます。エポックブロックの詳細については[エポックブロック](/docs/edge/consensus/pos-concepts#epoch-blocks)セクションを参照してください。

バリデータセットは各エポックの終わりに更新されます。ノードはエポックブロックの作成中にステーキングスマートコントラクトからバリデータセットをクエリし、取得したデータをローカルストレージに保存します。このクエリと保存のサイクルは各エポックの最後に繰り返されます。

基本的に、これによりステーキングスマートコントラクトがバリデータセットのアドレスを完全にコントロールし、ノードに唯一の責任 - 最新のバリデータセット情報を取り込むエポック中にコントラクトをクエリすることを確実にします。これは個別のノードからバリデータセットを管理する責任を軽減します。

### ステーキング {#staking}

アドレスは`stake`メソッドを呼び出し、トランザクションにステーク額の値を指定することで、ステーキングスマートコントラクトにファンドをステークすることができます。

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

ステーキングスマートコントラクトにファンドをステークすることにより、アドレスはバリデータセットを入力することができ、したがってブロック生成プロセスに参加できるようになります。

:::info ステーキング用のしきい値

現在、バリデータセットを入力する際の最小しきい値は`1 ETH`ステーキングに設定されています。

:::

### アンステーキング {#unstaking}

ファンドをステークしたアドレスでは、**ステークしたすべてのファンドのアンステークをすぐに**行うことができます。

アンステーキングはステーキングスマートコントラクトの`unstake`メソッドを呼び出すことで行います。

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

ファンドのアンステーク後、アドレスはステーキングスマートコントラクトのバリデータセットから削除され、次のエポック中はバリデータとみなされません。

## エポックブロック {#epoch-blocks}

**エポックブロック**はPolygon EdgeのIBFTのPoS実装に導入される概念です。

実質的に、エポックブロックは**トランザクションを含まない**特別なブロックであり、**エポックの最後**にのみ発生します。例えば、ブロックに**設定**した場合、`50`ブロックは`50`ブロック`100``150`とみなされます。

これらは通常のブロック生産中には発生しない追加ロジックを実行するために使用されます。

最も重要なことは、これらはノードがステーキングスマートコントラクトから**最新のバリデータセット情報を取得する**必要があることを示しているということです。

エポックブロックでバリデータセットを更新した後、バリデータセットは（変更または変更なしで）ステーキングスマートコントラクトから最新の情報を取り込むまで、その後の`epochSize - 1`ブロックのために使用されます。

エポックの長さ（ブロック）は、特別なフラグ`--epoch-size`を使用することで、ジェネシスファイルを生成する際に修正できます：

```bash
polygon-edge genesis --epoch-size 50 ...
```

エポックのデフォルトサイズはPolygon Edgeの`100000`ブロックです。

## コントラクトのプリデプロイメント {#contract-pre-deployment}

Polygon Edgeは、_プリデプロイ_
を[ステーキングスマートコントラクト](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)に行い、
それは、アドレス`0x0000000000000000000000000000000000001001`への**ジェネシス生成**中に行われます。

これはEVMを実行することなく、スマートコントラクトのブロックチェーンステートを変更することで、パスイン設定値をジェネシスコマンドに使用することで行われます。
