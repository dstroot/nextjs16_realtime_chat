// Generates a random 256-bit key for zero-knowledge client-side encryption.
// This key is used to encrypt/decrypt messages locally and is never sent to the server,
// ensuring that even the server owner cannot read the chats.
export const generateKey = (): string => {
  if (typeof window === "undefined") return "";
  const arr = new Uint8Array(32); // 256 bits
  window.crypto.getRandomValues(arr);
  return Array.from(arr)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Converts a hexadecimal string to a CryptoKey for AES-GCM encryption.
// This function is used to convert the generated key into a format that can
// be used by the Web Crypto API.
const getCryptoKey = async (keyHex: string): Promise<CryptoKey | null> => {
  if (!keyHex || keyHex.length !== 64) {
    return null;
  }
  try {
    const keyBytes = keyHex.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16));
    if (!keyBytes) return null;
    const keyBuffer = new Uint8Array(keyBytes);
    return await window.crypto.subtle?.importKey(
      "raw",
      keyBuffer,
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

  const ivHex = Array.from(iv)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  const encryptedHex = Array.from(new Uint8Array(encrypted))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

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

    const iv = new Uint8Array(
      ivHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );
    const data = new Uint8Array(
      dataHex.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
    );

    const decrypted = await window.crypto.subtle?.decrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );

    if (!decrypted) return null;

    return new TextDecoder().decode(decrypted);
  } catch (e) {
    console.error("Decryption failed", e);
    return null;
  }
};
