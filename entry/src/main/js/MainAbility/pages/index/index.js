import app from '@system.app';
import { isFileExist, readEncryptedData, storeEncryptedData } from '../../store/store';
import { decryptProcess, encryptProcess, generateRSAKey, isKeyItemExist } from '../../crypto/rsa';

let RSA_KEY_ALIAS = "RSA_KEY_ALIAS"

export default {
    data: {
        title: '',
        random: null,
        saveFileResult: "",
        encryptedText: "",
        decryptedText: ""
    },

    onInit() {
        isFileExist((isExistCallback) => {
            this.saveFileResult = isExistCallback
        })
    },

    async encryptAndWriteFile() {
        isKeyItemExist(RSA_KEY_ALIAS, (isKeyExist) => {
            console.log("Is Key Item: " + isKeyExist);

            if (isKeyExist) {
                this.storeEncryptedData();
                return;
            }

            if (!isKeyExist) {
                generateRSAKey(RSA_KEY_ALIAS, (isGenerateKey) => {
                    if (isGenerateKey) {
                        this.storeEncryptedData();
                        return;
                    }
                });
            }
        });
    },

    storeEncryptedData() {
        let encryptedData = encryptProcess();
        this.encryptedText = this.uint8ArrayToString(encryptedData);
        storeEncryptedData(encryptedData, (saveFileResCallback) => {
            this.saveFileResult = saveFileResCallback;
        })
    },

    decryptAndReadFile() {
        readEncryptedData((content) => {
            if (!content) {
                this.decryptedText = "No Encrypted Data"
                return;
            }
            this.decryptedText = content
        })
    },

    uint8ArrayToString(u) {
        let dataString = '';
        for (let i = 0; i < u.length; i++) {
            dataString += String.fromCharCode(u[i]);
        }
        return dataString;
    },

    appClose(e) {
        if (e.direction == "right") {
            app.terminate();
        }
    }
};