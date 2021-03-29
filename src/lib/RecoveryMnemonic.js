import { Mnemonic } from "@hashgraph/sdk";
const util_1 = require("@hashgraph/sdk/lib/crypto/util");
const Ed25519PrivateKey_1 = require("@hashgraph/sdk/lib/crypto/Ed25519PrivateKey");

// Override the toNewLegacyPrivateKey method in the Mnemonic class of SDK to compute legacy
// private key correctly
export class RecoveryMnemonic extends Mnemonic {
    async toNewLegacyPrivateKey() {
        const index = this._isLegacy ? 0 : 0;
        const entropy = this._isLegacy ? this._toLegacyEntropy() : await this._toLegacyEntropy2();
        const keyBytes = await util_1.legacyDeriveChildKey(entropy, index);
        return Ed25519PrivateKey_1.Ed25519PrivateKey.fromBytes(keyBytes);
    }
}
