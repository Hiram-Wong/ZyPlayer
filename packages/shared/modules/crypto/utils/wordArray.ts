import CryptoJS from 'crypto-js';

import type { Encode, ParseFunction, StringifyFunction } from '../type';

const wordArrayToUtf8 = (wordArray: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Utf8.stringify(wordArray);
};

const wordArrayToUtf16 = (wordArray: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Utf16.stringify(wordArray);
};

const wordArrayToUtf16Be = (wordArray: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Utf16BE.stringify(wordArray);
};

const wordArrayToUtf16Le = (wordArray: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Utf16LE.stringify(wordArray);
};

const wordArrayToHex = (wordArray: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Hex.stringify(wordArray);
};

const wordArrayToBase64 = (wordArray: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Base64.stringify(wordArray);
};

const wordArrayToLatin1 = (wordArray: CryptoJS.lib.WordArray): string => {
  return CryptoJS.enc.Latin1.stringify(wordArray);
};

export const stringify: { [key in Encode]: StringifyFunction } = {
  utf8: wordArrayToUtf8,
  utf16: wordArrayToUtf16,
  utf16be: wordArrayToUtf16Be,
  utf16le: wordArrayToUtf16Le,
  hex: wordArrayToHex,
  base64: wordArrayToBase64,
  latin1: wordArrayToLatin1,
};

const utf8ToWordArray = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf8.parse(str);
};

const utf16ToWordArray = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf16.parse(str);
};

const utf16BeToWordArray = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf16BE.parse(str);
};

const utf16LeToWordArray = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Utf16LE.parse(str);
};

const hexToWordArray = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Hex.parse(str);
};

const base64ToWordArray = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Base64.parse(str);
};

const latin1ToWordArray = (str: string): CryptoJS.lib.WordArray => {
  return CryptoJS.enc.Latin1.parse(str);
};

export const parse: { [key in Encode]: ParseFunction } = {
  utf8: utf8ToWordArray,
  utf16: utf16ToWordArray,
  utf16be: utf16BeToWordArray,
  utf16le: utf16LeToWordArray,
  hex: hexToWordArray,
  base64: base64ToWordArray,
  latin1: latin1ToWordArray,
};

export const wordArrayToArray = (wordArray: CryptoJS.lib.WordArray): Uint8Array => {
  const words = wordArray.words;
  const sigBytes = wordArray.sigBytes;
  const result = new Uint8Array(sigBytes);
  for (let i = 0; i < sigBytes; i++) {
    result[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
  }
  return result;
};

export const arrayToWordArray = (array: Uint8Array): CryptoJS.lib.WordArray => {
  const words: number[] = [];
  const len = array.length;
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= (array[i] & 0xff) << (24 - (i % 4) * 8);
  }
  return CryptoJS.lib.WordArray.create(words, len);
};

export const cloneWordArray = (wordArray: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  const clonedWords = wordArray.words.slice();
  const clonedSigBytes = wordArray.sigBytes;

  return CryptoJS.lib.WordArray.create(clonedWords, clonedSigBytes);
};

const wordArrayPadPkcs7 = (data: CryptoJS.lib.WordArray, blockSize: number): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.Pkcs7.pad(clonedData, blockSize);
  return clonedData;
};

const wordArrayPadAnsiX923 = (data: CryptoJS.lib.WordArray, blockSize: number): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.AnsiX923.pad(clonedData, blockSize);
  return clonedData;
};

const wordArrayPadIso10126 = (data: CryptoJS.lib.WordArray, blockSize: number): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.Iso10126.pad(clonedData, blockSize);
  return clonedData;
};

const wordArrayPadIso97971 = (data: CryptoJS.lib.WordArray, blockSize: number): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.Iso97971.pad(clonedData, blockSize);
  return clonedData;
};

const wordArrayPadZeroPadding = (data: CryptoJS.lib.WordArray, blockSize: number): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.ZeroPadding.pad(clonedData, blockSize);
  return clonedData;
};

const wordArrayPadNoPadding = (data: CryptoJS.lib.WordArray, blockSize: number): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.NoPadding.pad(clonedData, blockSize);
  return clonedData;
};

export const pad = {
  pkcs7padding: wordArrayPadPkcs7,
  ansix923: wordArrayPadAnsiX923,
  iso10126: wordArrayPadIso10126,
  iso97971: wordArrayPadIso97971,
  zeropadding: wordArrayPadZeroPadding,
  nopadding: wordArrayPadNoPadding,
};

const wordArrayUnpadPkcs7 = (data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.Pkcs7.unpad(clonedData);
  return clonedData;
};

const wordArrayUnpadAnsiX923 = (data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.AnsiX923.unpad(clonedData);
  return clonedData;
};

const wordArrayUnpadIso10126 = (data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.Iso10126.unpad(clonedData);
  return clonedData;
};

const wordArrayUnpadIso97971 = (data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.Iso97971.unpad(clonedData);
  return clonedData;
};

const wordArrayUnpadZeroPadding = (data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.ZeroPadding.unpad(clonedData);
  return clonedData;
};

const wordArrayUnpadNoPadding = (data: CryptoJS.lib.WordArray): CryptoJS.lib.WordArray => {
  const clonedData = cloneWordArray(data);
  CryptoJS.pad.NoPadding.unpad(clonedData);
  return clonedData;
};

export const unpad = {
  pkcs7padding: wordArrayUnpadPkcs7,
  ansix923: wordArrayUnpadAnsiX923,
  iso10126: wordArrayUnpadIso10126,
  iso97971: wordArrayUnpadIso97971,
  zeropadding: wordArrayUnpadZeroPadding,
  nopadding: wordArrayUnpadNoPadding,
};

export const base64ToHex = (base64: string): string => {
  const wordArray = base64ToWordArray(base64);
  return wordArrayToHex(wordArray);
};

export const hexToBase64 = (hex: string): string => {
  const wordArray = hexToWordArray(hex);
  return wordArrayToBase64(wordArray);
};

export const utf8ToHex = (utf8: string): string => {
  const wordArray = utf8ToWordArray(utf8);
  return wordArrayToHex(wordArray);
};

export const hexToUtf8 = (hex: string): string => {
  const wordArray = hexToWordArray(hex);
  return wordArrayToUtf8(wordArray);
};

export const base64ToUtf8 = (base64: string): string => {
  const wordArray = base64ToWordArray(base64);
  return wordArrayToUtf8(wordArray);
};

export const utf8ToBase64 = (utf8: string): string => {
  const wordArray = utf8ToWordArray(utf8);
  return wordArrayToBase64(wordArray);
};

export default {
  parse,
  stringify,
  arrayToWordArray,
  wordArrayToArray,
  cloneWordArray,
  pad,
  unpad,
};
