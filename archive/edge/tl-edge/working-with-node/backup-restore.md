---
id: backup-restore
title: Backup/restore ng node instance
description: "Kung paano i-back up at i-restore ang Polygon Edge node instance."
keywords:
  - docs
  - polygon
  - edge
  - instance
  - restore
  - directory
  - node
---

## Pangkalahatang-ideya {#overview}

Ang gabay na ito ay nagdedetalye kung paano i-back up at mai-restore ang isang Polygon Edge node instance.
Sinasaklaw nito ang mga base folder at kung ano ang kanilang nilalaman, pati na rin kung anong mga file ang kritikal para sa pagsasagawa ng isang matagumpay na pag-back up at pag-restore.

## Mga base folder {#base-folders}

Gumagamit ang Polygon Edge ng LevelDB bilang storage engine nito.
Kapag nagpapasimula ng isang Polygon Edge node, ang mga sumusunod na sub-folder ay nililikha sa tinukoy na working directory:
* **blockchain** - Nag-iimbak ng blockchain data
* **trie** - Nag-iimbak ng mga Merkle trie (world state data)
* **keystore** - Nag-iimbak ng mga pribadong key para sa client. Kabilang dito ang pribadong key ng libp2p at ang pribadong key ng sealing/validator
* **consensus** - Nag-iimbak ng anumang impormasyon ng consensus na maaaring kailanganin ng client habang gumagawa. Sa ngayon, nag-iimbak ito ng *pribadong validator key* ng node

Mahalaga para sa mga folder na ito na mapangalagaan para gumana nang maayos ang Polygon Edge instance.

## Gumawa ng backup mula sa isang gumaganang node at ibalik para sa bagong node {#create-backup-from-a-running-node-and-restore-for-new-node}

Ang seksyong ito ay gumagabay sa iyo sa paglikha ng archive data ng blockchain sa isang gumaganang node at pagpapanumbalik nito sa ibang instance.

### Pag-backup {#backup}

Ang `backup`command ay nagpapadala ng mga block mula sa isang gumaganang node sa pamamagitan ng gRPC at bumubuo ng isang archive file. Kung ang `--from` at `--to` ay wala sa command, ang command na ito ay magdadala ng mga block mula genesis hanggang sa pinakabago.

```bash
$ polygon-edge backup --grpc-address 127.0.0.1:9632 --out backup.dat [--from 0x0] [--to 0x100]
```

### Pag-restore {#restore}

Ang isang server ay nagsisimulang mag-import mula sa isang archive kapag nagsisimula sa `--restore` flag. Mangyaring tiyakin na mayroong key para sa bagong node. Para malaman ang higit pa tungkol sa pag-import o pagbuo ng mga key, bisitahin ang [Secret Managers na seksyon](/docs/edge/configuration/secret-managers/set-up-aws-ssm).

```bash
$ polygon-edge server --restore archive.dat
```

## I-back up/I-restore ang Buong data {#back-up-restore-whole-data}

Ang seksyong ito ay gumagabay sa iyo sa pag-backup ng data kasama ang state data at key at pagpapanumbalik sa bagong instance.

### Hakbang 1: Itigil ang tumatakbong client {#step-1-stop-the-running-client}

Dahil gumagamit ang Polygon Edge ng **LevelDB** para sa data storage, kailangang ihinto ang node sa panahon ng pag-backup,
dahil ang **LevelDB** ay hindi nagpapahintulot sa mga magkakasabay na pag-access sa mga database file nito.

Bukod pa rito, nagsasagawa rin ang Polygon Edge ng data flushing kapag magsara.

Ang unang hakbang ay nagsasangkot ng pagpapahinto sa tumatakbong client (alinman sa pamamagitan ng isang service manager o iba pang mekanismo na nagpapadala ng isang SIGINT signal sa proseso),
para ma-trigger nito ang 2 mga event habang maayos na nagsasara:
* Pagpapatakbo ng data flush sa disk
* Pag-release ng mga DB file lock sa pamamagitan ng LevelDB

### Hakbang 2: I-backup ang directory {#step-2-backup-the-directory}

Ngayong hindi na tumatakbo ang client, maaari nang i-back up ang data directory sa ibang medium.
Tandaan na ang mga file na may `.key` extension ay naglalaman ng pribadong key data na maaaring gamitin para gayahin ang kasalukuyang node,
at hindi sila dapat ibahagi sa isang third/hindi kilalang party.

:::info

Mangyaring manual na i-back up at i-restore ang file `genesis`, para ang mga naibalik na node ay maayos na magagamit.

:::

## Pag-restore {#restore-1}

### Hakbang 1: Itigil ang tumatakbong client {#step-1-stop-the-running-client-1}

Kung anumang instance ng Polygon Edge ay tumatakbo, kailangan itong mapahinto para maging matagumpay ang hakbang 2.

### Hakbang 2: Kopyahin ang na-back up na data directory tungo sa nais na folder {#step-2-copy-the-backed-up-data-directory-to-the-desired-folder}

Kapag hindi na tumatakbo ang client, ang data directory na na-back up kamakailan ay maaari nang kopyahin sa nais na folder. Bukod pa rito, i-restore ang kinopyang `genesis` file kamakailan.

### Hakbang 3: Patakbuhin ang Polygon Edge client habang tinutukoy ang tamang data directory {#step-3-run-the-polygon-edge-client-while-specifying-the-correct-data-directory}

Para magamit ng Polygon Edge ang ni-restore na data directory, sa paglulunsad, kailangang tukuyin ng user ang path patungo sa
data directory. Mangyaring kumonsulta sa [CLI Commands](/docs/edge/get-started/cli-commands) na seksyon para sa impormasyon tungkol sa `data-dir` flag.
