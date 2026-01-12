import huks from '@ohos.security.huks';

let RSA_KEY_ALIAS = 'RSA_KEY_ALIAS'
const HUKS_RSA_KEY_SIZE_1024 = 1024;
let plainText = 'HELLO HUAWEI';
let cipherText = '';
let handle;

function getRSAGenProperties() {
    let properties = new Array();
    let index = 0;
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_ALGORITHM,
        value: huks.HuksKeyAlg.HUKS_ALG_RSA
    };
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_KEY_SIZE,
        value: HUKS_RSA_KEY_SIZE_1024
    };
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_PURPOSE,
        value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_DECRYPT | huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_ENCRYPT
    };
    return properties;
}

export function generateRSAKey(rsaKeyAlias, callback) {
    let huksInfo;
    let options = { properties: getRSAGenProperties() };
    huks.generateKeyItem(rsaKeyAlias, options, (err, data) => {
        if (err) {
            huksInfo = `generateRSAKey return code: ${err.code}:${err.message}`;
            console.error(`generateRSAKey return code: ${huksInfo}`)
            callback(false)
        }
        huksInfo = `The key has been generated:${JSON.stringify(data)}`;
        callback(true)
    });
}

function getRSAEncryptProperties() {
    let properties = new Array();
    let index = 0;
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_ALGORITHM,
        value: huks.HuksKeyAlg.HUKS_ALG_RSA
    };
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_KEY_SIZE,
        value: HUKS_RSA_KEY_SIZE_1024
    };

    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_PURPOSE,
        value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_ENCRYPT
    };
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_PADDING,
        value: huks.HuksKeyPadding.HUKS_PADDING_PKCS1_V1_5
    };
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_DIGEST,
        value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256
    }
    return properties;
}

export function encryptProcess() {
    let ret = true;
    let huksInfo;
    let initOptions = {
        properties: getRSAEncryptProperties(),
        inData: new Uint8Array()
    }
    let finishOptions = {
        properties: getRSAEncryptProperties(),
        inData: stringToUint8Array(plainText)
    }
    huks.initSession(RSA_KEY_ALIAS, initOptions, (initErr, initData) => {
        if (initErr) {
            huksInfo = `encryptProcess initSession return code:${initErr.code}:${initErr.message}`;
            ret = false;
            huks.abortSession(initData.handle, initOptions, (abortErr, abortData) => {
                if (abortErr) {
                    huksInfo = `encryptProcess init abortSession return code:${abortErr.code}:${abortErr.message}`;
                }
            });
            console.info(`initSession log: ${huksInfo}`)
        } else {
            handle = initData.handle;
        }
    });

    if (!ret) {
        console.info(huksInfo)
    }

    huks.finishSession(handle, finishOptions, (finishErr, finishData) => {
        console.info('after finish session')
        if (finishErr) {
            ret = false;
            huksInfo = `encryptProcess finishSession return code:${finishErr.code}:${finishErr.message}`;
            huks.abortSession(handle, finishOptions, (abortErr, abortData) => {
                if (abortErr) {
                    huksInfo = `encryptProcess finish  abortSession return code:${abortErr.code}: ${abortErr.message}`;
                }
            });
        } else {
            huksInfo = finishData.outData;
        }
    });
    return huksInfo;
}

function uint8ArrayToString(fileData) {
    let dataString = '';
    for (let i = 0; i < fileData.length; i++) {
        dataString += String.fromCharCode(fileData[i]);
    }
    return dataString;
}

function stringToUint8Array(str) {
    let arr = [];
    for (let i = 0, j = str.length; i < j; ++i) {
        arr.push(str.charCodeAt(i));
    }
    return new Uint8Array(arr);
}

function getRSADecryptProperties() {
    let properties = new Array();
    let index = 0;
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_ALGORITHM,
        value: huks.HuksKeyAlg.HUKS_ALG_RSA
    };
    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_KEY_SIZE,
        value: HUKS_RSA_KEY_SIZE_1024
    };

    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_PURPOSE,
        value: huks.HuksKeyPurpose.HUKS_KEY_PURPOSE_DECRYPT
    };

    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_PADDING,
        value: huks.HuksKeyPadding.HUKS_PADDING_PKCS1_V1_5
    };

    properties[index++] = {
        tag: huks.HuksTag.HUKS_TAG_DIGEST,
        value: huks.HuksKeyDigest.HUKS_DIGEST_SHA256
    }

    return properties;
}

export function decryptProcess(input) {
    let len = HUKS_RSA_KEY_SIZE_1024 / 8;
    let ret = true;
    let outPlainText;
    let huksInfo;
    let initOptions = {
        properties: getRSADecryptProperties(),
        inData: new Uint8Array()
    }
    let updateOptions = {
        properties: getRSADecryptProperties(),
        inData: input
    }
    let finishOptions = {
        properties: getRSADecryptProperties(),
        inData: input
    }
    huks.initSession(RSA_KEY_ALIAS, initOptions, (initErr, initData) => {
        if (initErr) {
            huksInfo = `decryptProcess initSession return code:${initErr.code}: ${initErr.message}`;
            ret = false;
            huks.abortSession(initData.handle, initOptions, (abortErr, abortData) => {
                if (abortErr) {
                    huksInfo = `decryptProcess init abortSession return code:${abortErr.code}: ${abortErr.message}`;
                }
            });
        } else {
            handle = initData.handle;
        }
    });
    if (!ret) {
        return huksInfo;
    }
    huks.updateSession(handle, updateOptions, (updateErr, updateData) => {
        if (updateErr) {
            huksInfo = `decryptProcess updateSession return code:${updateErr.code}: ${updateErr.message}`;
            ret = false;
            huks.abortSession(handle, updateOptions, (abortErr, abortData) => {
                if (abortErr) {
                    huksInfo = `decryptProcess updateSession abortSession return code:${abortErr.code}: ${abortErr.message}`;
                }
            });
        }
    });

    if (!ret) {
        return huksInfo;
    }
    huks.finishSession(handle, finishOptions, (finishErr, finishData) => {
        if (finishErr) {
            ret = false;
            huksInfo = `decryptProcess finishSession return code:${finishErr.code}: ${finishErr.message}`;
            huks.abortSession(handle, finishOptions, (abortErr, abortData) => {
                if (abortErr) {
                    huksInfo = `decryptProcess finish  abortSession return code:${abortErr.code}: ${abortErr.message}`;
                }
            });
        } else {
            outPlainText = uint8ArrayToString(finishData.outData);
        }
    });
    if (!ret) {
        return huksInfo;
    } else {
        huksInfo = outPlainText;
    }
    return huksInfo;
}

export function isKeyItemExist(keyAlias, callback) {
    let emptyOptions = {
        properties: []
    };

    huks.isKeyItemExist(keyAlias, emptyOptions, (err, data) => {
        if (data) {
            callback(true)
        } else {
            callback(false)
        }
    });
}

export default {
    generateRSAKey,
    encryptProcess,
    decryptProcess,
    isKeyItemExist
}