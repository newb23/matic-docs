---
id: pos-concepts
title: Preuve d'Enjeu
description: "Explication et instructions concernant la Preuve d'Enjeu."
keywords:
  - docs
  - polygon
  - edge
  - PoS
  - stake
---

## Aperçu {#overview}

Cette section vise à donner un meilleur aperçu de certains concepts actuellement présents dans la Preuve d'Enjeu (PoS).
 Mise en oeuvre du Polygon Edge.

La mise en œuvre de la Preuve d'Enjeu (PoS) de Polygon Edge se veut une alternative à la mise en œuvre existante de la PoA IBFT,
donnant aux opérateurs de nœuds la possibilité de choisir facilement entre les deux au moment de démarrer une chaîne.

## Caractéristiques de la Preuve d'Enjeu {#pos-features}

La logique de base de la mise en œuvre de la Preuve d'Enjeu se trouve dans
le **[contrat intelligent Staking](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)**

Ce contrat est pré-déployé chaque fois qu'un mécanisme de PoS de la chaîne de Polygon Edge est initialisé, et est disponible sur l'adresse
`0x0000000000000000000000000000000000001001`  du bloc `0`.

### Époques {#epochs}

Les époques sont un concept introduit avec l'ajout de la PoS au Polygon Edge.

Les époques sont considérées comme un cadre temporel spécial (en blocs) au cours duquel un certain ensemble de validateurs peut produire des blocs.
 Leurs longueurs sont modifiables, ce qui signifie que les opérateurs de nœuds peuvent configurer la longueur d'une époque pendant la génération de la genèse.

À la fin de chaque époque, un _bloc d'époque_ est créé, et après cet événement, une nouvelle époque commence. Pour en savoir plus sur
les blocs d'époques, consultez la section [Blocs d'époques](/docs/edge/consensus/pos-concepts#epoch-blocks).

Les ensembles de validateurs sont mis à jour à la fin de chaque époque. Les nœuds interrogent l'ensemble des validateurs du Contrat Intelligent de Staking
pendant la création du bloc d'époque et enregistrent les données obtenues dans le stockage local. Ce cycle de requête et de sauvegarde est
répété à la fin de chaque époque.

Essentiellement, il garantit que le Contrat Intelligent de Staking a le contrôle total des adresses de l'ensemble de validateurs, et
ne laisse aux nœuds qu'une seule responsabilité : interroger le contrat une fois par époque pour obtenir les dernières informations
sur l'ensemble de validateurs. Cela permet de décharger les nœuds individuels de la responsabilité de s'occuper des ensembles de validateurs.

### Staking {#staking}

Les adresses peuvent faire le stake des fonds sur le Contrat Intelligent en invoquant la `stake` méthode , et en spécifiant une valeur pour
le montant en stake dans la transaction :

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.stake({value: STAKE_AMOUNT})
````

En faisant le stake des fonds sur le contrat Intelligent de Staking, les adresses peuvent entrer dans l'ensemble des validateurs et ainsi être en mesure de participer au
processus de production de blocs.

:::info Limite pour le staking

Actuellement, la limite minimum pour entrer dans l'ensemble des validateurs est le staking `1 ETH`

:::

### Défaire le stake {#unstaking}

Les adresses possédant des fonds en stake ne peuvent **débloquer que la totalité de ces fonds en une seule fois**.

On peut défaire le stake en invoquant la `unstake`méthode  sur le Contrat Intelligent de Staking :

````js
const StakingContractFactory = await ethers.getContractFactory("Staking");
let stakingContract = await StakingContractFactory.attach(STAKING_CONTRACT_ADDRESS)
as
Staking;
stakingContract = stakingContract.connect(account);

const tx = await stakingContract.unstake()
````

Après le déblocage de leurs fonds, les adresses sont retirées de l'ensemble des validateurs du Contrat Intelligent de Staking et ne seront pas
reconnues comme validateurs lors de la prochaine époque.

## Blocs d'Époque {#epoch-blocks}

**Les Blocs dÉpoque** sont un concept introduit dans la Preuve de Participation de la mise en oeuvre d'IBFT dans Polygon Edge.

Essentiellement, les blocs d'époque sont des blocs spéciaux qui ne contiennent **aucune transaction** et n'apparaissent qu'à **la fin d'une époque**.
 Par exemple, si la **taille** d'époque est définie sur des `50`blocs, les blocs d'époques seraient considérés comme des blocs , `50`, et ainsi `100``150`de suite.

Ils sont utilisés pour exécuter une logique supplémentaire qui ne devrait pas se produire lors de la production de blocs ordinaires.

Plus essentiellement, ils indiquent au nœud **qu'il doit aller chercher les dernières informations sur l'ensemble de validateurs**
dans le Contrat Intelligent de Staking.

Après avoir mis à jour l'ensemble de validateurs au bloc d'époque, l'ensemble de validateurs (modifié ou inchangé)
 est utilisé pour les `epochSize - 1` blocs suivants, jusqu'à ce qu'il soit à nouveau mis à jour en extrayant les dernières informations
le Contrat Intelligent de Staking.

La longueur des époques (en blocs) est modifiable lors de la génération du fichier de genèse, en utilisant un indicateur spécial `--epoch-size` :

```bash
polygon-edge genesis --epoch-size 50 ...
```

La taille par défaut d'une époque est de `100000` blocs dans le Polygon Edge.

## Pré-déploiement du contrat {#contract-pre-deployment}

Le Polygon Edge _pré-déploie_
le [Contrat Intelligent de Staking](https://github.com/0xPolygon/staking-contracts/blob/main/contracts/Staking.sol)
pendant **la génération de la genèse** à l'adresse `0x0000000000000000000000000000000000001001`.

Pour ce faire, il n'est pas nécessaire de disposer d'une machine virtuelle Ethereum (EVM) en cours d'exécution, car il modifie directement l'état de la blockchain du Contrat Intelligent, en utilisant
les valeurs de configuration transmises à la commande de genèse.
