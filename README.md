# key-recovery-tool
A tool that tries to find a Hedera account based solely on the recovery phrases

## Description
Hedera accounts have had multiple recovery phase schemes in the past, before settling down to the current 24-word BIP-39 based phrases.

This tool takes recovery phrases for as input from any of those formats, and attempts to recover the account.

## Installation

### Pre-requisites
Install nodejs/npm (https://www.npmjs.com/get-npm)

### Configure
Edit the .env flle in the key-recovery-tool directory. You can use .env.sample as a starter template and provide the URLs for mainnet and testnet mirror nodes. 
*Please note that today, there is no public mirror node for Hedera mainnet*

### Start the tool
Once  you have edited the .env file, you can use the following commands to start the tool locally:

```bash
cd key-recovery-tool
npm install
npm run serve
```


