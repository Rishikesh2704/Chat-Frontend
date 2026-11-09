const DB_NAME = "Keys";
const DB_VR = 1;

export const generateUserKeyPairs = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: { name: "SHA-256" },
    },
    true,
    ["wrapKey", "unwrapKey"],
  );

  const jwkPublicKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.publicKey,
  );
  const jwkPrivateKey = await window.crypto.subtle.exportKey(
    "jwk",
    keyPair.privateKey,
  );

  return {
    publicKey: jwkPublicKey,
    privateKey: jwkPrivateKey,
    rawKeyPair: keyPair,
  };
};

export const generateSharedKey = async (
  recipientPublicKey: string,
  userId: string,
) => {
  try {
    const storedSharedKey = await getSharedKey(userId);
    if (storedSharedKey.rawSharedKey) {
      return storedSharedKey;
    }
    const sharedKey = await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"],
    );

    const encryptedSharedKey = await encyptSharedKey(
      sharedKey,
      recipientPublicKey,
    );
    console.log("encyrptedSharedKey:", encryptedSharedKey);
    return {
      rawSharedKey: sharedKey,
      encryptedSharedKeyString: encryptedSharedKey,
    };
  } catch (error) {
    console.log("Failed to generate sharedKey: ", error);
  }
};

export const storeSharedKey = async (
  rawSharedKey: CryptoKey,
  encryptedSharedKey: string,
  userId: string,
) => {
  const req = indexedDB.open(DB_NAME, DB_VR);

  req.onsuccess = (e: any) => {
    const db = e?.target?.result;
    const transaction = db.transaction("sharedKey", "readwrite");
    const store = transaction.objectStore("sharedKey");
    store.add({
      userId: userId,
      rawSharedKey: rawSharedKey,
      encryptedSharedKey: encryptedSharedKey,
      algorithm: "AES-GCM",
    });
  };

  req.onerror = () => {
    console.log("Error while storing private key: ", req.error);
    req.error;
  };
};

export const storePrivateKey = async (privateKey: CryptoKey) => {
  const req = indexedDB.open(DB_NAME, DB_VR);
  req.onupgradeneeded = () => {
    const db = req.result;
    db.createObjectStore("privateKey", { keyPath: "id" });
    db.createObjectStore("sharedKey", { keyPath: "userId" });
  };
  req.onsuccess = (e: any) => {
    const db = e?.target?.result;
    const transaction = db.transaction("privateKey", "readwrite");
    const store = transaction.objectStore("privateKey");
    store.add({
      id: "user-private-key",
      privateKey: privateKey,
      algorithm: "RSA-OAEP",
    });
  };

  req.onerror = () => {
    console.log("Error while storing private key: ", req.error);
    req.error;
  };
  // const db:any = await indexDb();
};

export const encyptSharedKey = async (sharedKey: CryptoKey, key: any) => {
  const parsedKey = JSON.parse(key);
  console.log("Parsed Key: ", parsedKey);
  const importedRecipientPublicKey = await window.crypto.subtle.importKey(
    "jwk",
    parsedKey,
    { name: "RSA-OAEP", hash: { name: "SHA-256" } },
    true,
    ["wrapKey"],
  );
  console.log("Imported Public Key: ", importedRecipientPublicKey);
  const encryptedSharedKey = await window.crypto.subtle.wrapKey(
    "jwk",
    sharedKey,
    importedRecipientPublicKey,
    { name: "RSA-OAEP" },
  );

  return btoa(String.fromCharCode(...new Uint8Array(encryptedSharedKey)));
};

export const getSharedKey = async (
  userId: string,
): Promise<{ rawSharedKey: CryptoKey; encryptedSharedKeyString: string }> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VR);
    req.onsuccess = () => {
      const db = req.result;
      const transaction = db.transaction("sharedKey", "readwrite");
      const store = transaction.objectStore("sharedKey").get(userId);
      store.onsuccess = () =>
        resolve({
          rawSharedKey: store.result?.rawSharedKey,
          encryptedSharedKeyString: store.result?.encryptedSharedKey,
        });
    };
    req.onerror = () => {
      console.log("Failed retrieve sharedKey");
      reject(req.error);
    };
  });
};

export const encryptMessage = async (message: string, userId: string) => {
  const encodedMessage = new TextEncoder().encode(message);
  const { rawSharedKey: sharedKey } = await getSharedKey(userId);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encrypt = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", length: 256, iv },
    sharedKey,
    encodedMessage,
  );
  return {
    encryptedMessage: btoa(String.fromCharCode(...new Uint8Array(encrypt))),
    iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
  };
};

const getPrivateKey = async (): Promise<CryptoKey> => {
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

export const decryptMessage = async (
  message: any,
  key: any,
  iv: any,
  userId: string,
) => {
  try {
    let sharedKey;
    let privateKey = await getPrivateKey();
    const { rawSharedKey } = await getSharedKey(userId);
    sharedKey = rawSharedKey;
    if (!rawSharedKey) {
      const sharedKeyArrayBuffer = Uint8Array.from(atob(key), (c) =>
        c.charCodeAt(0),
      );
      sharedKey = await window.crypto.subtle.unwrapKey(
        "jwk",
        sharedKeyArrayBuffer,
        privateKey,
        {
          name: "RSA-OAEP",
        },
        {
          name: "AES-GCM",
          length: 256,
        },
        true,
        ["encrypt", "decrypt"],
      );
      await storeSharedKey(sharedKey, key, userId);
    }

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
      sharedKey,
      messageBinaryArray,
    );

    let decodedMessage = new TextDecoder().decode(decryptedMessage);
    return decodedMessage;
  } catch (error) {
    console.log("Failed To Decrypt Message: ", error);
  }
};
