const CryptoJS = require('crypto-js');

const encryptionKey = 'votreCleSecrete';

// Fonction pour crypter les données
export const encryptData = (data) => {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), encryptionKey).toString();
    return encryptedData;
};

// Fonction pour décrypter les données
export const decryptData = (encryptedData) => {
    const decryptedData = CryptoJS.AES.decrypt(encryptedData, encryptionKey).toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
};

