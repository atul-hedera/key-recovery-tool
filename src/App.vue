<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex" style="margin:auto;">
        <h3>Hedera key recovery tool</h3>
      </div>
    </v-app-bar>

    <v-main class="main">
      <div v-if="invalidSetup" style="color:red; font-size: 1em;">
        Invalid setup of the tool.
        <p />
        Please create/update the .env file and try again.
      </div>
      <div v-else>
        <div class="intro-text">
          This tool allows you to recover your keys from your saved
          recovery phrases.
          Based on the recovery phases that you provide, the tool
          generates multiple keys at various indices and checks if there
          are Hedera accounts with those keys.

          If any accounts are found with a matching public key, this tool
          displays it in the box below.
        </div>

        <PhraseInput @start-recovery="startRecovery" @phrases-changed="phrasesChanged" />
        <ResultDisplay v-bind:result="result" />
      </div>
    </v-main>
  </v-app>
</template>

<script>
const dotenv = require("dotenv");
const axios = require("axios");

import PhraseInput from "./components/PhraseInput.vue";
import ResultDisplay from "./components/ResultDisplay.vue";

export default {
  name: "App",
  components: { PhraseInput, ResultDisplay },

  data: () => ({
    result: null,
    invalidSetup: false,
  }),

  methods: {
    // Attempt the recovery process
    async startRecovery(mnemonic) {
      this.recoveryAttempted = true;
      let found = false;
      this.result = null;
      if (mnemonic != null) {
        const listOfKeys = await this.createPossibleKeyList(mnemonic, "");

        // Check if an account exists either on the mainnet or on the testnet for
        // each of the possible keys
        for (const k of listOfKeys) {
          for (const network of ["Mainnet", "Testnet"]) {
            this.result = {
              status: 0,
              network: network,
              key: k.publicKey,
              accounts: null,
            };
            const accounts = await this.checkAKey(network, k.publicKey);
            if (accounts != false) {
              this.result = {
                status: 1,
                network: network,
                key: k,
                accounts: accounts,
              };
              found = true;
              break;
            }
          }
          if (found) {
            break;
          }
        }
      }
      if (!found) {
        this.result = { status: -1, network: null, key: null, accounts: null };
      }
    },

    // Generate all possible keys based on the mnemonic
    async createPossibleKeyList(mnemonic, password) {
      let possibleKeys = [];

      if (mnemonic.words.length === 24) {
        // 24 words: could be BIP39 or legacy derivation scheme
        const legacyKey = await mnemonic.toLegacyPrivateKey();
        possibleKeys.push({
          index: null,
          description: "Key based on legacy 24-words",
          privateKey: legacyKey,
          publicKey: legacyKey.publicKey,
        });

        for (let index = 0; index < process.env.VUE_APP_MAX_KEY_INDICES; index++) {
          const derivedLegacyKey = await legacyKey.legacyDerive(index);
          possibleKeys.push({
            index: index,
            description: `Key derived at index: ${index} based on legacy 24-words`,
            privateKey: derivedLegacyKey,
            publicKey: derivedLegacyKey.publicKey,
          });
        }

        const key = await mnemonic.toPrivateKey(
          password == null ? "" : password
        );
        possibleKeys.push({
          index: null,
          description: "Key based on 24-words",
          privateKey: key,
          publicKey: key.publicKey,
        });
        if (key.supportsDerivation) {
          for (let index = 0; index < process.env.VUE_APP_MAX_KEY_INDICES; index++) {
            const derivedKey = await key.derive2(index);
            possibleKeys.push({
              index: index,
              description: `Key derived at index: ${index} based on 24-words`,
              privateKey: derivedKey,
              publicKey: derivedKey.publicKey,
            });
          }
        }
      } else if (mnemonic.words.length == 22) {
        // Old 22-word format
        const legacy22PrivateKey = await mnemonic.toNewLegacyPrivateKey();
        possibleKeys.push({
          index: 0,
          description: `Key derived based on legacy 22-words`,
          privateKey: legacy22PrivateKey,
          publicKey: legacy22PrivateKey.publicKey,
        });
        for (let index = 0; index < process.env.VUE_APP_MAX_KEY_INDICES; index++) {
          const derivedLegacy22Key = await legacy22PrivateKey.legacyDerive(
            index
          );
          possibleKeys.push({
            index: index,
            description: `Key derived at index: ${index} based on legacy 22-words`,
            privateKey: derivedLegacy22Key,
            publicKey: derivedLegacy22Key.publicKey,
          });
        }
      }
      return possibleKeys;
    },

    // Check if an account exists with the given public key by quering Hedera mirror node API
    async checkAKey(network, publicKey) {
      for (const raw of [true, false]) {
        let mirrornodeEndPoint = "http://unknown";
        if (network === "Mainnet") {
          mirrornodeEndPoint =
            process.env.VUE_APP_MIRRORNODE_ENDPOINT_FOR_MAINNET;
        } else if (network === "Testnet") {
          mirrornodeEndPoint =
            process.env.VUE_APP_MIRRORNODE_ENDPOINT_FOR_TESTNET;
        }
        let url = `${mirrornodeEndPoint}/api/v1/accounts?account.publickey=${publicKey.toString(
          raw
        )}`;
        const resp = await axios.get(url);
        if (Object.prototype.hasOwnProperty.call(resp.data, "accounts") &&
          resp.data.accounts.length > 0) {
          return { network: network, accounts: resp.data.accounts };
        }
      }
      return false;
    },
    phrasesChanged() {
      this.result = null;
    },
  },
  mounted() {
    // Read the configuration file
    dotenv.config();
    if (
      !process.env.VUE_APP_MIRRORNODE_ENDPOINT_FOR_MAINNET ||
      !process.env.VUE_APP_MIRRORNODE_ENDPOINT_FOR_MAINNET ||
      !process.env.VUE_APP_MAX_KEY_INDICES ||
      isNaN(process.env.VUE_APP_MAX_KEY_INDICES)
    ) {
      this.invalidSetup = true;
    }
  },
};
</script>

<style lang="scss" scoped>
.main {
  background-color: #f0f0f0;
  max-width:500px;
  align-self: center;;
}
.intro-text {
  text-align: center;
  margin: 1em;
  font-size: 0.6em;
}
</style>
