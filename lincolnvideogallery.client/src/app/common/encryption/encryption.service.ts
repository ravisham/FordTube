import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { IUser } from '../../core/user/user';

/**
 * @description EncryptionService handles encryption and decryption of data using AES.
 */
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {
  private aesKey: string;

  constructor() {
    // Initialize with an empty key
    this.aesKey = '';
  }

  /**
   * Sets the AES key for decryption.
   * @param {string} key - The AES key.
   */
  setKey(key: string): void {
    this.aesKey = key;
  }

  /**
    * Decrypts the specified data using AES decryption.
    * @param {string} encryptedData - The encrypted data as a base64 string.
    * @returns {JwtUser} The decrypted data.
    * @throws Will throw an error if the AES key is not set.
    */
  decrypt(encryptedData: string): IUser {
    if (!this.aesKey) {
      throw new Error('AES key is not set.');
    }

    try {
      const encryptedBytes = CryptoJS.enc.Base64.parse(encryptedData);

      // Extract the IV and ciphertext from the combined data
      const ivSize = 16; // AES block size in bytes
      const iv = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(0, ivSize / 4));
      const ciphertext = CryptoJS.lib.WordArray.create(encryptedBytes.words.slice(ivSize / 4));

      const key = CryptoJS.enc.Base64.parse(this.aesKey);

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: ciphertext },
        key,
        { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      const decryptedStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedStr) {
        throw new Error('Decryption resulted in empty string');
      }

      const decryptedData = JSON.parse(decryptedStr);

      // Convert date strings to Date objects
      if (decryptedData.starsDateChecked) {
        decryptedData.starsDateChecked = new Date(decryptedData.starsDateChecked);
      }
      if (decryptedData.disclaimerDateChecked) {
        decryptedData.disclaimerDateChecked = new Date(decryptedData.disclaimerDateChecked);
      }

      return decryptedData as IUser;
    } catch (error) {
      console.error('Decryption failed:', error.message);
      console.error('Encrypted Data:', encryptedData);
      throw new Error('Failed to decrypt data.');
    }
  }
}
