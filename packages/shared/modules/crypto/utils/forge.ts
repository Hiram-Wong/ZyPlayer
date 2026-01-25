import { util } from 'node-forge';

const bytesTobase64 = (bytes: util.ByteBuffer): string => {
  return util.encode64(bytes);
};

const bytesToHex = (bytes: util.ByteBuffer): string => {
  return util.bytesToHex(bytes);
};

const bytesToUtf8 = (bytes: util.ByteBuffer): string => {
  return util.decodeUtf8(bytes);
};

const bytesToUtf16 = (bytes: util.ByteBuffer): string => {
  return util.text.utf16.decode(bytes);
};

const hexToBytes = (str: string): util.ByteBuffer => {
  return util.hexToBytes(str);
};

const base64ToBytes = (str: string): util.ByteBuffer => {
  return util.decode64(str);
};

const utf8ToBytes = (str: string): util.ByteBuffer => {
  return util.encodeUtf8(str);
};

const utf16ToBytes = (str: string): util.ByteBuffer => {
  return util.text.utf16.decode(str);
};

export const parse = {
  utf8: utf8ToBytes,
  utf16: utf16ToBytes,
  hex: hexToBytes,
  base64: base64ToBytes,
};

export const stringify = {
  utf8: bytesToUtf8,
  utf16: bytesToUtf16,
  hex: bytesToHex,
  base64: bytesTobase64,
};

export const cloneBytes = (buffer: util.ByteBuffer): util.ByteBuffer => {
  const clonedBuffer = util.createBuffer();
  const data = buffer.getBytes();
  clonedBuffer.putBytes(data);

  return clonedBuffer;
};

export const arrayToBytes = (array: Uint8Array): util.ByteBuffer => {
  return util.createBuffer(array);
};

export const bytesToArray = (buffer: util.ByteBuffer): Uint8Array => {
  const clonedData = cloneBytes(buffer);
  const bytesStr = clonedData.getBytes();
  const uint8Array = new Uint8Array(bytesStr.length);
  for (let i = 0; i < bytesStr.length; i++) {
    uint8Array[i] = bytesStr.charCodeAt(i);
  }
  return uint8Array;
};

export default { parse, stringify, arrayToBytes, bytesToArray };
