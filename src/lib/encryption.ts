// Converts a Uint8Array to a hexadecimal string
const byteArrayToHex = (bytes: Uint8Array): string => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Converts a hexadecimal string to a Uint8Array
const hexToByteArray = (hex: string): Uint8Array => {
  const bytes = hex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
  if (!bytes) throw new Error("Invalid hex string");
  return new Uint8Array(bytes);
};

// Validates an encryption key
export const validateEncryptionKey = (
  key: string | null
): { valid: boolean; error?: string } => {
  if (!key) {
    return { valid: false, error: "Missing encryption key" };
  }
  if (key.length !== 64) {
    return { valid: false, error: "Invalid encryption key format" };
  }
  // Check if it's a valid hex string
  if (!/^[0-9a-fA-F]{64}$/.test(key)) {
    return { valid: false, error: "Invalid encryption key format" };
  }
  return { valid: true };
};

// Generates a random 256-bit key for zero-knowledge client-side encryption.
// This key is used to encrypt/decrypt messages locally and is never sent to the server,
// ensuring that even the server owner cannot read the chats.
export const generateKey = (): string => {
  if (typeof window === "undefined") return "";
  const arr = new Uint8Array(32); // 256 bits
  window.crypto.getRandomValues(arr);
  return byteArrayToHex(arr);
};

// Converts a hexadecimal string to a CryptoKey for AES-GCM encryption.
// This function is used to convert the generated key into a format that can
// be used by the Web Crypto API.
const getCryptoKey = async (keyHex: string): Promise<CryptoKey | null> => {
  const validation = validateEncryptionKey(keyHex);
  if (!validation.valid) {
    return null;
  }
  try {
    const keyBuffer = hexToByteArray(keyHex);
    return await window.crypto.subtle?.importKey(
      "raw",
      keyBuffer as BufferSource,
      { name: "AES-GCM" },
      false,
      ["encrypt", "decrypt"]
    );
  } catch (error) {
    console.error("Invalid key format", error);
    return null;
  }
};

// Encrypts a text using AES-GCM encryption with a given key.
// The function returns the encrypted text as a hexadecimal string.
export const encrypt = async (
  text: string,
  keyHex: string
): Promise<string> => {
  const key = await getCryptoKey(keyHex);
  if (!key) throw new Error("Invalid encryption key");

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(text);

  const encrypted = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoded
  );

  const ivHex = byteArrayToHex(iv);
  const encryptedHex = byteArrayToHex(new Uint8Array(encrypted));

  return `${ivHex}:${encryptedHex}`;
};

// Decrypts an encrypted text using AES-GCM decryption with a given key.
// The function returns the decrypted text as a string.
export const decrypt = async (
  encryptedText: string,
  keyHex: string
): Promise<string | null> => {
  try {
    const [ivHex, dataHex] = encryptedText.split(":");
    if (!ivHex || !dataHex) return null;

    const key = await getCryptoKey(keyHex);
    if (!key) return null;

    const iv = hexToByteArray(ivHex);
    const data = hexToByteArray(dataHex);

    const decrypted = await window.crypto.subtle?.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      data as BufferSource
    );

    if (!decrypted) return null;

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};
