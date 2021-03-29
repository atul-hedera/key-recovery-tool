<template>
    <div>
        <v-container fluid v-if="result">
            <v-row v-if="result.status > 0" justify="center">
                <v-card justify="center" width="80%" shaped>
                    <div style="font-size: 1.2em; margin:1em 2em 1em 2em;">
                        You have just found your Hedera account
                    </div>
                    <v-card justify="center">
                        <v-divider></v-divider>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title
                                    >Public key</v-list-item-title
                                >
                                <div class="key-text">
                                    ASN.1: {{ result.key.publicKey }}
                                </div>
                                <div class="key-text">
                                    Raw:
                                    {{ result.key.publicKey.toString(true) }}
                                </div>
                            </v-list-item-content>
                        </v-list-item>
                        <v-divider></v-divider>
                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title
                                    >Private key
                                    <v-btn
                                        color="primary"
                                        x-small
                                        @click="
                                            showPrivateKey = !showPrivateKey
                                        "
                                    >
                                        {{ showPrivateKey ? "Hide" : "Reveal" }}
                                    </v-btn>
                                </v-list-item-title>

                                <div
                                    :class="{ 'blur-content': !showPrivateKey }"
                                    class="key-text"
                                >
                                    ASN.1: {{ result.key.privateKey }}
                                </div>
                                <div
                                    :class="{ 'blur-content': !showPrivateKey }"
                                    class="key-text"
                                >
                                    Raw:
                                    {{ result.key.privateKey.toString(true) }}
                                </div>
                            </v-list-item-content>
                        </v-list-item>

                        <v-divider></v-divider>

                        <v-list-item>
                            <v-list-item-content>
                                <v-list-item-title
                                    >Account details</v-list-item-title
                                >
                                <div style="font-size:0.9em; color:grey;">
                                    <div
                                        v-for="account of result.accounts
                                            .accounts"
                                        :key="account.account"
                                    >
                                        Account {{ account.account }} on Hedera
                                        {{ result.accounts.network }} with a
                                        balance of
                                        {{(account.balance.balance /100000000).toFixed(2)}} ℏ<br/>
                                        View on
                                        <a :href="'https://explorer.kabuto.sh/' + result.accounts.network +
                                                    '/id/' + account.account"
                                            target="_blank"
                                            >Kabuto
                                        </a>,
                                        <a :href="'https://' + (result.accounts.network == 'Mainnet' ? 
                                                    'app' : result.accounts.network) +
                                                    '.dragonglass.me/hedera/accounts/' +
                                                    account.account"
                                            target="_blank"
                                            >Dragonglass
                                        </a>
                                    </div>
                                </div>
                            </v-list-item-content>
                        </v-list-item>
                    </v-card>
                </v-card>
            </v-row>

            <v-row v-if="result.status < 0" justify="center" class="text-wrap">
                <v-card justify="center" width="80%" shaped>
                    <div style="font-size: 1.2em; margin:1em 2em 1em 2em;">
                        We are sorry. We couldn't find any Hedera account that
                        matches the recovery words above.
                    </div>
                </v-card>
            </v-row>

            <v-row v-if="result.status == 0" justify="center">
                <v-card justify="center" width="80%" shaped>
                    <div style="font-size: 1.2em; margin:1em 2em 1em 2em;">
                        <h4>Attempting key</h4>
                        <p></p>
                        <h5 style="color:grey;word-break:break-all;">
                            {{ result.key.toString(true) }}
                        </h5>
                        <p></p>
                        <h4>on Hedera {{ result.network }}</h4>
                    </div>
                </v-card>
            </v-row>
        </v-container>
    </div>
</template>

<script>
export default {
    name: "ResultDisplay",
    props: ["result"],
    data() {
        return {
            showPrivateKey: false,
        };
    },
};
</script>

<style lang="scss" scoped>
.found-private-key-div {
    display: inline-block;
    margin-right: 1em;
}
.key-text {
    word-break: break-all;
    font-size: 0.9em;
    color: grey;
    margin-top: 1em;
    margin-bottom: 1em;
}
.blur-content {
    filter: blur(4px);
}
</style>
