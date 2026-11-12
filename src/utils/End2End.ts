const DB_NAME = "Keys";
const DB_VR = 1;

export const generateUserKeyPairs = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"],
  );

  const publicKeyBuffer = await crypto.subtle.exportKey(
    "raw",
    keyPair.publicKey,
  );
  const jwkPrivateKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey,
  );
  return {
    publicKey: btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer))),
    privateKey: jwkPrivateKey,
    rawKeyPair: keyPair,
  };
};

export const generateKeyFromPassword = async (
  password: string,
  salt: any = null,
) => {
  const encodedPassword = new TextEncoder().encode(password);
  const passwordKey = await window.crypto.subtle.importKey(
    "raw",
    encodedPassword,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const newSalt = salt || window.crypto.getRandomValues(new Uint8Array(16));
  const masterKey = await window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: newSalt,
      iterations: 600000,
      hash: "SHA-256",
    },
    passwordKey,
    {
      name: "AES-GCM",
      length: 256,
    },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );

  return { masterKey: masterKey, salt: btoa(String.fromCharCode(...newSalt)) };
};

export const deriveSharedKey = async (
  recipientPublicKey: string,
): Promise<CryptoKey | null> => {
  try {
    const parsedPublicKey = Uint8Array.from(atob(recipientPublicKey), (c) =>
      c.charCodeAt(0),
    );

    const userPrivateKey = await getPrivateKey();
    const importPublicKey = await window.crypto.subtle.importKey(
      "raw",
      parsedPublicKey,
      {
        name: "ECDH",
        namedCurve: "P-256",
      },
      true,
      [],
    );
    const derivedSecret = await window.crypto.subtle.deriveKey(
      {
        name: "ECDH",
        public: importPublicKey,
      },
      userPrivateKey,
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );
    return derivedSecret;
  } catch (error) {
    console.log("Failed to derive shared secret:", error);
    return null;
  }
};

export const storePrivateKey = async (privateKey: CryptoKey) => {
  const req = indexedDB.open(DB_NAME, DB_VR);
  req.onupgradeneeded = () => {
    const db = req.result;
    db.createObjectStore("privateKey", { keyPath: "id" });
  };
  req.onsuccess = () => {
    const db = req.result;
    const transaction = db.transaction("privateKey", "readwrite");
    const store = transaction.objectStore("privateKey");
    store.put({
      id: "user-private-key",
      privateKey: privateKey,
      algorithm: "ECDH",
    });
  };

  req.onerror = () => {
    console.log("Error while storing private key: ", req.error);
    req.error;
  };
};

export const getPrivateKey = async (): Promise<CryptoKey> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VR);
    req.onsuccess = (e: any) => {
      const db = e.target.result;
      const transaction = db.transaction("privateKey", "readwrite");
      const store = transaction
        .objectStore("privateKey")
        .get("user-private-key");
      store.onsuccess = () => {
        resolve(store.result.privateKey);
      };
      store.onerror = () => reject(store.error);
    };
    req.onerror = () => reject(req.error);
  });
};

export const encryptPrivateKey = async (
  jwkPrivateKey: JsonWebKey,
  masterKey: CryptoKey,
) => {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const privateKey = await window.crypto.subtle.importKey(
    "jwk",
    jwkPrivateKey,
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"],
  );
  const encryptedPrivateKey = await window.crypto.subtle.wrapKey(
    "jwk",
    privateKey,
    masterKey,
    {
      name: "AES-GCM",
      length: 256,
      iv: iv,
    },
  );
  return {
    encryptedPrivateKey: btoa(
      String.fromCharCode(...new Uint8Array(encryptedPrivateKey)),
    ),
    iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
  };
};

export const decryptEncryptedPrivate = async (
  encryptedPrivateKey: string,
  password: string,
  salt: string,
  iv: string,
) => {
  const saltBuffer = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const privateKeyArrayBuffer = Uint8Array.from(
    atob(encryptedPrivateKey),
    (c) => c.charCodeAt(0),
  );
  const { masterKey } = await generateKeyFromPassword(password, saltBuffer);
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  const decryptedPrivateKey = await window.crypto.subtle.unwrapKey(
    "jwk",
    privateKeyArrayBuffer,
    masterKey,
    {
      name: "AES-GCM",
      length: 256,
      iv: ivBuffer,
    },
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits"],
  );
  return decryptedPrivateKey;
};

export const encryptMessage = async (
  message: string,
  recipientPublicKey: string,
) => {
  const encodedMessage = new TextEncoder().encode(message);
  const sharedSecret = await deriveSharedKey(recipientPublicKey);
  if (!sharedSecret) return;
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypt = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", length: 256, iv },
    sharedSecret,
    encodedMessage,
  );
  return {
    encryptedMessage: btoa(String.fromCharCode(...new Uint8Array(encrypt))),
    iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
  };
};

export const decryptMessage = async (
  message: any,
  sharedSecret: CryptoKey,
  iv: any,
) => {
  try {
   
    const messageBinaryArray = Uint8Array.from(atob(message), (c) =>
      c.charCodeAt(0),
    );
    const ivArrayBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
    const decryptedMessage = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        length: 256,
        iv: ivArrayBuffer,
      },
      sharedSecret,
      messageBinaryArray,
    );

    let decodedMessage = new TextDecoder().decode(decryptedMessage);
    return decodedMessage;
  } catch (error) {
    console.log("Failed To Decrypt Message: ", error);
  }
};
