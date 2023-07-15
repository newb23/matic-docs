---
id: validators
title: Perguntas frequentes sobre validadores
description: "Perguntas frequentes sobre os validadores do Polygon Edge"
keywords:
  - docs
  - polygon
  - edge
  - FAQ
  - validators

---

## Como adicionar/remover um validador? {#how-to-add-remove-a-validator}

### PoA {#poa}
A adição/remoção de validadores é feita por votação. Pode encontrar [aqui](/docs/edge/consensus/poa) um guia completo sobre este assunto.

### PoS {#pos}
Pode encontrar [aqui](/docs/edge/consensus/pos-stake-unstake) um guia sobre como fazer o stake de fundos, para que um nó possa tornar-se validador, e o unstake (remover o validador).

Note que:
- Pode usar o flag génese `--max-validator-count` para definir um número máximo de stakers que podem juntar-se ao conjunto de validadores.
- Pode usar o flag génese `--min-validator-count ` para definir o número mínimo de stakers necessários para aderir ao conjunto de validadores (`1` por defeito).
- Quando se atinge o número máximo de validadores, deixa de ser possível adicionar outro validador até remover um existente do conjunto (independentemente de o montante da participação do novo validador ser superior). Se remover um validador, o número de validadores restantes não pode ser inferior a `--min-validator-count`.
- Existe um limite padrão de `1` unidade de moeda de rede (gás) nativa para se tornar validador.



## Qual é o espaço em disco recomendado para um validador? {#how-much-disk-space-is-recommended-for-a-validator}

Recomendamos que comece com 100 G como base estimada de forma conservadora, garantindo que é possível ampliar o espaço em disco posteriormente.


## Existe um limite para o número de validadores? {#is-there-a-limit-to-the-number-of-validators}

Se estamos a falar de limitações técnicas, o Polygon Edge não tem explicitamente um limite para o número de nós que pode ter em rede. Pode definir os limites de ligação (número de ligações de entrada/saída) numa base "por nó".

Se estamos a falar de limitações práticas, verá um pior desempenho com um cluster de 100 nós do que com um cluster de 10 nós. Ao aumentar o número de nós no cluster, aumenta a complexidade da comunicação e apenas os custos de rede em geral. Tudo depende do tipo de rede que está a usar e do tipo de topologia de rede que tem.

## Como mudar de PoA para PoS? {#how-to-switch-from-poa-to-pos}

O PoA é o mecanismo de consenso padrão. Para um novo cluster, mudar para PoS implica adicionar o flag `--pos` ao gerar o ficheiro de génese. Se tem um cluster em execução, encontra [aqui](/docs/edge/consensus/migration-to-pos) informação sobre como efetuar a mudança. Todas as informações de que precisa sobre os nossos mecanismos de consenso e configuração podem ser encontradas na nossa [secção sobre consenso](/docs/edge/consensus/poa).

## Como atualizo os meus nós quando houver uma quebra de código? {#how-do-i-update-my-nodes-when-there-s-a-breaking-change}

Pode encontrar um guia detalhado sobre este procedimento [aqui](/docs/edge/validator-hosting#update).

## A quantidade mínima de staking é configurável para o PoS Edge? {#is-the-minimum-staking-amount-configurable-for-pos-edge}

A quantidade mínima de staking é, por defeito, `1 ETH` e não é configurável.

## Por que razão os comandos JSON RPC `eth_getBlockByNumber` e `eth_getBlockByHash` não devolvem o endereço do minerador? {#not-return-the-miner-s-address}

O consenso atualmente utilizado no Polygon Edge é o IBFT 2.0, que, por sua vez, se baseia no mecanismo de votação explicado em Clique PoA: [ethereum/EIPs#225](https://github.com/ethereum/EIPs/issues/225).

Analisando o EIP-225 (Clique PoA), esta é a parte relevante que explica para que é usado o  `miner`(também conhecido como `beneficiary`):

<blockquote>
Adaptamos os campos de cabeçalho ethash da seguinte forma:
<ul>
<li><b>beneficiário/minerador: </b> endereço utilizado para propor a alteração da lista de assinantes autorizados.</li>
<ul>
<li>Normalmente, deve ser preenchido com zeros, sendo modificado apenas durante a votação.</li>
<li>Contudo, são permitidos valores arbitrários (mesmo os que não fazem sentido, como a votação de não assinantes) para evitar uma complexidade extra nas implementações em torno da mecânica de votação.</li>
<li> Deve ser preenchido com zeros nos blocos de checkpoint (isto é, transição de época). </li>
</ul>

</ul>

</blockquote>

Assim, o campo `miner` é usado para propor um voto a favor de um determinado endereço, e não para mostrar o proponente do bloco.

As informações sobre o proponente do bloco podem ser encontradas recuperando a pubkey no campo Seal do campo de dados extra Instanbul codificado por RLP nos cabeçalhos do bloco.

## Que partes e valores do Genesis podem ser modificados com segurança? {#which-parts-and-values-of-genesis-can-safely-be-modified}

:::caution

Certifique-se de criar uma cópia manual do arquivo genesis.json existente antes de tentar editá-lo. Além disso, toda a chain tem de ser interrompida antes de editar o arquivo genesis.json. Assim que o arquivo de gênese for modificado, a versão mais recente dele tem de ser distribuída em todos os nós não validadores e valdiator

:::

**Somente a seção de bootnodes do arquivo de gênese pode ser modificada com segurança**, onde pode adicionar ou remover bootnodes da lista.