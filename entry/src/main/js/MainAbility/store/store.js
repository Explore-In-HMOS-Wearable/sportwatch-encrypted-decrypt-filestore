import file from '@system.file'
import { decryptProcess } from '../crypto/rsa'

const encrptedFilesFolderPath = "internal://app/encrptedfiles/"

export const encryptedFilePath = encrptedFilesFolderPath + "encrypted.txt"

const ensurePathExist = () => {
    file.mkdir({
        uri: encrptedFilesFolderPath,
    })
}

export const fileUriToIndex = (uri) => {
    const index = uri.split(".")[0];
    return parseInt(index);
}

const storeEncryptedData = (arr, saveFileResCallback) => {
    ensurePathExist();
    file.writeArrayBuffer({
        uri: encryptedFilePath,
        buffer: arr,
        encoding: 'UTF-8',
        success: () => {
            saveFileResCallback("File successfully saved.")
        },
        fail: (err, code) => {
            console.log(`Failed save file: ${err}, code: ${code}`)
            saveFileResCallback(`Failed save file: ${err}, code: ${code}`)
        }
    })
}

const isFileExist = (isExistCallback) => {
    file.get({
        uri: encryptedFilePath,
        success: () => {
            isExistCallback(`Saved file found`)
            return
        },
        fail: () => {
            isExistCallback(`File not exist`)
        }
    })
}

const readEncryptedData = (getFileResCallback) => {
    file.get({
        uri: encryptedFilePath,
        success: () => {
        },
        fail: () => {
            getFileResCallback(`File not exist`)
        }
    })
    let encryptedData = new Uint8Array();
    file.readArrayBuffer({
        uri: encryptedFilePath,
        success: (content) => {
            encryptedData = content.buffer
            let decrypted = decryptProcess(encryptedData)
            console.log("aaaa" + decrypted)
            getFileResCallback(decrypted)
        },
        fail: (err, errCode) => {
            getFileResCallback(`Failed get file: ${err}, code: ${errCode}`)
        }
    });

}

export { storeEncryptedData, readEncryptedData, isFileExist }