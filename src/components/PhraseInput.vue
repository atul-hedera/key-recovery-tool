<template>
    <div>
        <v-container fluid>
            <v-row justify="center" align="center" style="margin:1em;">
                <v-textarea
                    ref="phraseInputs"
                    v-model="phraseInput"
                    @input="checkPhraseInputs"
                    :auto-grow="true"
                    :clearable="true"
                    :label="'Recovery phrases'"
                    :outlined="true"
                    :placeholder="
                        'Enter or paste your recovery phrases here (space or comma separated)'
                    "
                    :rounded="true"
                    :row-height="30"
                    :rows="3"
                    background-color="white"
                >
                </v-textarea>
            </v-row>
            <v-row justify="center" align="center" style="margin:1em;">
                <div style="width:1em;"></div>
                <v-btn
                    @click="startRecovery"
                    :disabled="!revoveryPhrasesValidFlag"
                    style="height:4em; border-radius:4em;background-color:lightgreen;"
                    >Recover</v-btn
                >
            </v-row>

            <v-row dense justify="center">
                <div class="status-text">
                    <div
                        v-bind:class="{
                            errortext: !revoveryPhrasesValidFlag,
                            oktext: revoveryPhrasesValidFlag,
                        }"
                    >
                        {{ this.status }}
                    </div>
                </div>
            </v-row>
        </v-container>
    </div>
</template>

<script>
import { RecoveryMnemonic } from "../lib/RecoveryMnemonic.js";
export default {
    name: "PhraseInput",
    data: () => ({
        phraseInput: "",
        recoveryPhrases: "",
        mnemonic: null,
        password: "",
        revoveryPhrasesValidFlag: false,
        status: "",
        maxIndex: 2,
        found: { key: null, accounts: null },
    }),
    methods: {
        // Return count of words in the input
        countInputWords() {
            this.scrubInputWords();
            if (this.recoveryPhrases == "") {
                return 0;
            } else {
                return this.recoveryPhrases.split(" ").length;
            }
        },

        // Clean up punctuation marks and repeated whitespaces
        scrubInputWords() {
            if (this.phraseInput == null) {
                this.recoveryPhrases = "";
                return;
            }
            this.recoveryPhrases = this.phraseInput
                .toLowerCase()
                .replaceAll(/[^a-z \t]/g, " ")
                .replaceAll(/\t/g, " ")
                .replaceAll(/[ ]+/g, " ")
                .trim();
        },

        // Check the input phrases for errors and set the revoveryPhrasesValidFlag accordingly
        async checkPhraseInputs() {
            this.revoveryPhrasesValidFlag = false;
            this.mnemonic = null;
            this.$emit("phrases-changed");

            try {
                this.scrubInputWords();
                const words = this.recoveryPhrases.split(" ");

                if (this.recoveryPhrases == "" || words.length == 0) {
                    this.status = " ";
                    return;
                }

                if (words.length != 22 && words.length != 24) {
                    this.status = "Please enter either 24 or 22 (legacy) words";
                    return;
                }

                this.mnemonic = await new RecoveryMnemonic(
                    this.recoveryPhrases.split(" ")
                );

                const status = await this.mnemonic.validate();
                this.status = this.capitalize(status.toString());
            } catch (err) {
                console.log(err);
                this.status = "Invalid phrasewords";
            }

            if (this.status == "Mnemonic passed validation") {
                this.status =
                    "Recovery phrases are valid. Please click on the recover button to start recovery.";
                this.revoveryPhrasesValidFlag = true;
            }
        },

        // Start the recovery process
        startRecovery() {
            this.$emit("start-recovery", this.mnemonic);
        },

        // Utility function to capitalize the first letter
        capitalize(str) {
            if (typeof str == "string" && str.length > 0) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }
        },
    },
};
</script>
<style lang="scss" scoped>
.status-text {
    text-align: center;
    color: darkgreen;
    height: 100px;
}
.errortext {
    color: orangered;
}
</style>
