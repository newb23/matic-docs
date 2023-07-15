---
id: wallet-bridge-faq
title: Wallet <> Bridge FAQ
description: Build your next blockchain app on Polygon.
keywords:
  - docs
  - matic
  - polygon
  - wiki
  - wallet
image: https://wiki.polygon.technology/img/polygon-logo.png
---
import useBaseUrl from '@docusaurus/useBaseUrl';

## Where can I use the Polygon Web Wallet?
Here is the Polygon Wallet Suite URL: https://wallet.polygon.technology/
The Polygon Wallet Suite is a collection of Web3 applications provided by Polygon. It consists of the [Polygon Wallet](https://wallet.polygon.technology/polygon/assets) (a decentralized wallet), [Polygon Bridge](https://wallet.polygon.technology/polygon/bridge/deposit) (an L1-L2 bridge), [Polygon Staking](https://staking.polygon.technology/) (an environment for staking and delegating MATIC tokens) and [Polygon Safe Bridge](https://safe-bridge.polygon.technology/safe) (a multisig bridge).

<div align= "center">
  <img src={useBaseUrl("img/faq/wallet/wallet-hp.png")} />
</div>

## Which wallets are currently supported?

Metamask, Coinbase, Bitski Wallet, Venly and WalletConnect are the currently supported wallets.

<div align="center">
  <img src={useBaseUrl("img/faq/wallet/supported-wallets.png")} width="400" />
</div>

## What can I do with my Polygon wallet?

- Send funds to any account on Polygon.
- Deposit funds from Ethereum to Polygon (using the bridge).
- Withdraw funds back to Ethereum from Polygon (also using the bridge).

## My MetaMask wallet is not connecting with Polygon wallet

There are many reasons why this might be happening. We suggest that you **try another time**, **use another browser** or, if any of these doesn’t help, **[contact our support team](https://support.polygon.technology/support/home)**.

## How can I deposit Funds from Ethereum to Polygon using Polygon Wallet Suite.
Please watch the video below or follow [this tutorial](/docs/develop/wallets/polygon-web-wallet/web-wallet-v3-guide.md#depositing-funds-from-ethereum-to-polygon).

<video loop autoplay width="70%" height="70%" controls="true" >
  <source type="video/mp4" src="/img/wallet/v3/deposit/deposit-polygon-wallet.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

## How can I withdraw funds from Polygon to Ethereum via PoS Bridge using Polygon Wallet Suite?
Please watch the video below or follow [this tutorial](/docs/develop/wallets/polygon-web-wallet/web-wallet-v3-guide.md#withdrawing-funds-from-polygon-back-to-ethereum-on-pos-bridge).

<video loop autoplay width="70%" height="70%" controls="true" >
  <source type="video/mp4" src="/img/wallet/v3/pos/withdraw-polygon-wallet.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

## How to add a new or custom token to Polygon Wallet Token list?
Please follow  [this tutorial](/docs/faq/adding-a-custom-token).

## How do I find the token contract?

The token contract address will be required when you are trying to add a new or custom token. You can search for the token by its name on either Coingecko or CoinMarketCap where you will be able to see its address on the Ethereum chain (for ERC20 tokens) and other supported blockchains like Polygon. The token address on other chains might not be updated but you can surely use the root address for all purposes.

## I have deposited my funds but I don’t see it on Metamask. What do I do?

You need to manually add the custom token address to Metamask.

Open MetaMask and scroll down to click on **Import tokens**.

<div align="center">
<img src={useBaseUrl("img/wallet-bridge/wallet-faq-3.png")} width="400" />
</div>

Then, add the relevant contract address, symbol, and decimal precision. Contract addresses (PoS-WETH in this case) can be found on this link: [https://docs.polygon.technology/docs/operate/mapped-tokens/](https://docs.polygon.technology/docs/operate/mapped-tokens/). You will need to add the child token address to view balances on Polygon Mainnet. The decimal of precision is 18 for WETH (for most tokens, the decimal of precision is 18).

## How can I add Polygon Mainnet on Metamask?

Check [this tutorial](/docs/tools/wallets/metamask/config-polygon-on-metamask).

## My token is not visible in the list. Who should I contact?

Reach out to the Polygon team on Discord or Telegram and get your token listed. Before that, ensure your token is mapped. If it is not mapped, please raise a request at [https://mapper.polygon.technology/](https://mapper.polygon.technology/).

## Can I cancel my transaction after the checkpoint arrived?
Once the withdrawal transaction is initiated on the Polygon Mainnet, then unfortunately it can't be canceled or reverted.
In withdrawal transactions, tokens are burned from the Polygon Mainnet and minted on the Ethereum Mainnet.
Therefore, tokens once burned from the Polygon chain can't be reverted back to your wallet.

## The gas fee is too high, can I cancel my transaction?

Unfortunately, we can not cancel the withdrawal transaction once tokens are burned from the Polygon Mainnet. In other words, it is impossible to cancel a transaction once it is initiated.
The gas fee is not controlled by the Polygon. It is totally dependent on the network congestion and the number of transactions in a particular block on the Ethereum Mainnet.
If you think you can not afford the current gas fee, you can wait and try to proceed with your transaction later when the gas fee is on the lower side.
You can also monitor the gas fee on the Ethereum Mainnet from here: https://etherscan.io/gastracker


## Can I send my tokens from Polygon to any other wallet/exchange ?

You cannot directly send tokens from Polygon UI to exchanges/wallets. You have to first withdraw from Polygon to Ethereum and then send it to your exchange address (unless your exchange/wallet explicitly supports the network).

## I made the mistake of sending funds to an exchange/wallet directly. Can you help?

Unfortunately, we can not assist in such cases. Please don't send funds directly to exchanges that support only Ethereum, you have to first withdraw from Polygon to Ethereum and then send it to your exchange address.

##  I made a transfer to the wrong address. How do I retrieve the funds?

Unfortunately, nothing can be done. Only the owner of the private keys to that particular address can move those assets.
It’s always advisable to confirm if the address you are sending tokens to is the right one.

## My transaction has been pending for too long, what can I do?
The transaction might be dropped due to the following reasons:

1. Setting up a low gas price while submitting the transaction.
2. A sudden surge in the gas price due to congestion on the Ethereum Mainnet.
3. The transaction is canceled by you from your wallet or replaced with a new transaction.

You can proceed with the dropped transactions in the following ways:

1. If your transaction is stuck for more than an hour, a **Try Again** button will be shown. You can click on the **Try Again** button to complete the same transaction. You can refer to this video for more information on how to use the **Try Again** feature.
2. Please check your MetaMask wallet as well because sometimes transactions might be dropped due to queued-up transactions in the Metamask. In that case, clear the queued-up transactions or re-install the MetaMask in the same browser.
3. You can install the MetaMask in an alternate browser and then try to complete the transaction using Polygon Wallet Suite.
4. You can also use this link to complete the pending withdrawal transaction. Paste the transaction hash in the search option and click the **Confirm Exit** button to complete the transaction.

## What do I do if the deposit is confirmed but the balance is not getting updated?

It takes 22-30 minutes for the deposit transaction to complete. Please wait for some time and click on **Refresh Balance**.

## What should I do if the checkpoint is not happening?

Checkpoints sometimes take more than 45 minutes to 1 hour based on network congestion on Ethereum, we suggest waiting for a while before raising a ticket.

## My transaction is stuck.

We have listed some common errors that users might face. You can find the solution below the image of the error. In case you're shown a different error, please [raise a support ticket](https://support.polygon.technology/support/home) for our team to troubleshoot.

### Common Errors

<img src={useBaseUrl("img/wallet-bridge/checkpoint-rpc-error.png")} width="357" height="600"/>

The current RPC error you're facing might be due to an RPC overload.

Please try changing your RPC and proceed with the transaction. You may follow this link [here](https://docs.polygon.technology/docs/operate/network#matic-mainnet) for more information.

<img src={useBaseUrl("img/wallet-bridge/checkpoint-stumbled-error.png")} width="357" height="600"/>

This is usually an off-and-on error that gets resolved automatically. In case you are still receiving the same error while reinitiating the step, do [raise a support ticket](https://support.polygon.technology/) with all the relevant information to troubleshoot this further.

## I'm shown an insufficient balance error.

Withdrawals and deposits on the Polygon network are cheap. What is to be understood is that the insufficient balance error can be cleared by getting some ETH balance on the Ethereum Mainnet. That generally clears out the problem of an insufficient balance.
If this is a transaction on the Polygon Mainnet, we'll require that you have a sufficient amount of MATIC tokens.

## My transactions are not visible on the explorer. What should I do?

This is probably an indexing issue with Polygonscan. Please contact the [Support Team](https://support.polygon.technology/support/home) for more clarifications.

## I initiated a deposit on Ethereum but it still shows as pending. What should I do?

Your supplied gas is probably too low. You should wait a while and redo the transaction if it doesn't get mined. In case of additional help, please reach out to the [support team](https://support.polygon.technology/support/home) with your wallet address, transaction hashes (if any) and relevant screenshots.

## I'm not getting a transaction hash and my deposits aren't going through? What is happening?

You probably have prior pending transactions, please cancel or speed them up first. Transactions in Ethereum can only happen one after the other.

## It shows Polygon does not charge any amount for a withdrawal but we are to pay during the transaction.

On the PoS bridge, the withdrawal transaction happens over two steps: Token burning on the Polygon network and proof submission on the Ethereum network. Token burning that happens on the Polygon Mainnet will be a minimal cost. The remaining steps that happen on the Ethereum Mainnet will have to be paid in ETH depending on the current gas price which can be verified [here](https://ethgasstation.info/).

## I was trying to make a deposit but the transaction stopped at the Approve step.

If the transaction is still at the **Approve** step, it is not yet complete. To fulfill it, you need to pay the gas fee and then it should go through.

## Polygon wallet shows ‘User denied transaction signature’ error message.

This usually happens because the user canceled or refused to sign a transaction via MetaMask. When prompted by the MetaMask wallet, proceed with signing the transaction by clicking on **Approve** and not on **Cancel**.

## The transaction is successful but it shows pending.

If your transaction is completed and you received your funds but still the transaction shows pending on the UI, you can raise a support ticket by sending relevant details and screenshots.

## What is the list of Supported Exchanges on Polygon?

The MATIC coin can be traded in many exchanges. However, it’s always important to do your own research when you are choosing one to trade. It is not unusual that some exchanges keep making changes to their current available tokens and also have maintenance periods.

You might visit [Coinmarketcap](https://coinmarketcap.com/currencies/polygon/markets/) for a list of exchanges where you might find MATIC.

## Does Polygon support hardware wallets?

Yes, we support the following hardware wallets:
1. Trezor
2. Ledger

Users can connect their Hardware wallet option on MetaMask and proceed with their transaction.
Here is the link to connect the hardware wallet on Metamask:
https://metamask.zendesk.com/hc/en-us/articles/4408552261275

## Why isn’t the MATIC token supported on PoS?

MATIC is the native token of Polygon and it has a contract address - 0x0000000000000000000000000000000000001010 on the Polygon chain. It is also used to pay for gas. Mapping the MATIC token on the PoS bridge will lead to MATIC having an additional contract address on the Polygon chain. This will collide with the existing contract address as this new token address can not be used to pay for gas and will have to remain as a normal ERC20 token on the Polygon chain.

## How do I map tokens?

Please refer to [this tutorial] (/docs/pos/design/bridge/ethereum-polygon/submit-mapping-request) or you could go straight to the [Token Mapper](https://mapper.polygon.technology/).

## What do I do if the transaction is taking too long or if the gas price is too high?

Transaction time and gas price varies based on network congestion and it is also determined by supply and demand between the network’s miners.

What you could do:
- Be patient.
- Increase the gas fee if it is too slow.
- Check the fees before sending transactions. Here is a link for Etherscan's gas tracker:
https://etherscan.io/gastracker

What you shouldn’t do:
- Please do not set the gas limit low or your transaction might fail.
- Do not attempt to cancel the transaction. Check the fees beforehand.


## Can I change the gas limit or the gas price?

The gas limit is estimated and set by the application according to certain requirements of the function being called in the contract. This should not be edited. Only the gas price can be changed in order to increase or decrease the transaction fees.

## How to speed up the transactions?
You can do so by increasing the gas fees. Here's a link explaining how to do it on Metamask: https://metamask.zendesk.com/hc/en-us/articles/360015489251-How-to-Speed-Up-or-Cancel-a-Pending-Transaction.

## How much MATIC token is enough for the gas fee?
Users need to have a minimum of 0.01 MATIC in the Polygon mainnet.

## Where do I raise a support ticket?
If you need help from our specialists, please send us a message at https://support.polygon.technology/support/home.

## How do I bridge assets across chains?

Polygon offers a bridge to move assets from Ethereum to Polygon and vice versa. You can learn more about it on the [Bridges section](/pos/design/bridge/ethereum-polygon/getting-started.md) of this wiki.

However, if you are using any external service that is not owned by Polygon, we advise you to reach out to their customer service to request tutorials and instructions. It is also important to do your own research when you are using web3 services.

## I have a token withdrawal issue with OpenSea or any other application which uses polygon bridge.

If you have an issue with your withdrawal transaction being stuck, Polygon offers the withdraw bridge with [https://withdraw.polygon.technology](https://withdraw.polygon.technology) to help get you off the ground if you have your burn hash. With this tool, you're quickly onboarded and the issue will be resolved. Other questions concerning your transaction with OpenSea and other dApps will have to be handled by the application team.

## I have been scammed. How will I retrieve my tokens?

Unfortunately, there is no recovery process for lost coins. We ask that before you make a transaction, you go on to check and double-check before starting and completing it. Please note that the Polygon network and our official handles do not engage in any giveaway posts or token doubling and we will never approach you on behalf of the organization. Please disregard all attempts as they're most likely scams. All our communications are through our official handles.

## There are some unauthorized transactions in my wallet. Is my wallet hacked?

Unfortunately, the network cannot revert unwanted transactions.
It is always important to be careful with your private keys and **never share them with anyone**.
If you still have some remaining funds, transfer them immediately to a new wallet.

## Ethereum has Goerli as its test network. Does Polygon Network have a test network too?

As the Ethereum Network has Goerli as its test network, the Polygon Mainnet has Mumbai. All transactions on this test network will be indexed on the Mumbai Explorer.

## How can I swap my tokens for other tokens?
Please watch the video below or follow [this tutorial](/docs/develop/wallets/polygon-web-wallet/web-wallet-v3-guide.md#token-swap).

<video loop autoplay width="70%" height="70%" controls="true" >
  <source type="video/mp4" src="/img/wallet/v3/swap-token.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

## The Token Swap is too slow.

If you are trying to swap tokens and it is taking too long, you could try the same transaction on a different browser. If that doesn’t work and you’re facing an error, please send a screenshot to our Support team.

## Which tokens are charged as the gas fees for token swap?
Only MATIC.

## How can I swap my token for gas?
Please watch the video below or follow [this tutorial](/docs/develop/wallets/polygon-web-wallet/web-wallet-v3-guide.md#swap-for-gas).

<video loop autoplay width="70%" height="70%" controls="true" >
  <source type="video/mp4" src="/img/wallet/v3/swap-gas.mp4"></source>
  <p>Your browser does not support the video element.</p>
</video>

## Which tokens can be used to swap for gas?
Only these Tokens are supported for ‘Swap for Gas’: ETH, USDC, USDT, DAI, AAVE, LINK, WBTC, UNI, GHST, TEL, EMON, and COMBO.

## How to get ETH tokens?
To acquire ETH tokens, you can either trade them for another token or fiat money on an exchange, buy them on an on-ramp (or on Metamask) or even swap other tokens for ETH using [Polygon’s token swap feature](https://wallet.polygon.technology/polygon/token-swap).

## How can I get MATIC tokens to pay for gas fees?

We provide a [Gas Swap](https://wallet.polygon.technology/gas-swap/) service that will help you with that. You choose an amount of MATIC you need to complete your transaction and you can swap it for other tokens such as Ether or USDT. It’s worth noting that this is a **gas-less transaction**.

## Where can I get MATIC tokens directly?

So MATIC tokens can be bought from any centralized ([Binance](https://www.binance.com/en), [Coinbase](https://www.coinbase.com/), et.al) or Decentralized ([Uniswap](https://uniswap.org/), [QuickSwap](https://quickswap.exchange/#/swap)) exchange. You may also research and try some on-ramps like [Transak](https://transak.com/), and [Ramp](https://ramp.network/).
The purpose for your purchase of MATIC coins should also determine where you'll buy them from and the network. It is advisable to have MATIC on the Ethereum mainnet if your intention is either staking or delegation. If your intent is a transaction on the Polygon Mainnet, you should hold and transact with MATIC on the Polygon Mainnet.





