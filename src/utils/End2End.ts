const DB_NAME = "Keys";
const DB_VR = 1;

export const generateUserKeyPairs = async () => {
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: "ECDH",
      namedCurve: "P-256",
    },
    true,
    ["deriveKey", "deriveBits",],
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
    privateKey:jwkPrivateKey,
    rawKeyPair: keyPair,
  };
};

// export const generateSharedKey = async (
//   recipientPublicKey: string,
//   // usersPrivateKey:CryptoKey
//   userId: string,
// ) => {
//   try {
//     const storedSharedKey = await getSharedKey(userId);
//     if (storedSharedKey.rawSharedKey) {
//       return storedSharedKey;
//     }
//     const sharedKey = await window.crypto.subtle.generateKey(
//       {
//         name: "AES-GCM",
//         length: 256,
//       },
//       true,
//       ["encrypt", "decrypt"],
//     );

//     const encryptedSharedKey = await encyptSharedKey(
//       sharedKey,
//       recipientPublicKey,
//     );
//     console.log("encyrptedSharedKey:", encryptedSharedKey);
//     return {
//       rawSharedKey: sharedKey,
//       encryptedSharedKeyString: encryptedSharedKey,
//     };
//   } catch (error) {
//     console.log("Failed to generate sharedKey: ", error);
//   }
// };

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
    ["encrypt", "decrypt", 'wrapKey', 'unwrapKey'],
  );

  return { masterKey: masterKey, salt: btoa(String.fromCharCode(...newSalt)) };
};

// export const storeSharedKey = async (
//   rawSharedKey: CryptoKey,
//   encryptedSharedKey: string,
//   userId: string,
// ) => {
//   const req = indexedDB.open(DB_NAME, DB_VR);

//   req.onsuccess = (e: any) => {
//     const db = e?.target?.result;
//     const transaction = db.transaction("sharedKey", "readwrite");
//     const store = transaction.objectStore("sharedKey");
//     store.add({
//       userId: userId,
//       rawSharedKey: rawSharedKey,
//       encryptedSharedKey: encryptedSharedKey,
//       algorithm: "AES-GCM",
//     });
//   };

//   req.onerror = () => {
//     console.log("Error while storing private key: ", req.error);
//     req.error;
//   };
// };

export const storePrivateKey = async (privateKey: CryptoKey) => {
  const req = indexedDB.open(DB_NAME, DB_VR);
  req.onupgradeneeded = () => {
    const db = req.result;
    db.createObjectStore("privateKey", { keyPath: "id" });
  };
  req.onsuccess = (e: any) => {
    const db = e?.target?.result;
    const transaction = db.transaction("privateKey", "readwrite");
    const store = transaction.objectStore("privateKey");
    store.add({
      id: "user-private-key",
      privateKey: privateKey,
      algorithm: "ECDH",
    });
  };

  req.onerror = () => {
    console.log("Error while storing private key: ", req.error);
    req.error;
  };
  // const db:any = await indexDb();
};

// export const encyptSharedKey = async (sharedKey: CryptoKey, key: any) => {
//   const parsedKey = JSON.parse(key);
//   console.log("Parsed Key: ", parsedKey);
//   const importedRecipientPublicKey = await window.crypto.subtle.importKey(
//     "jwk",
//     parsedKey,
//     { name: "RSA-OAEP", hash: { name: "SHA-256" } },
//     true,
//     ["wrapKey"],
//   );
//   console.log("Imported Public Key: ", importedRecipientPublicKey);
//   const encryptedSharedKey = await window.crypto.subtle.deriveKey(
//     {
//       name:'ECDH',
//       publicKey:importedRecipientPublicKey
//     },sharedKey,
//     {
//       name
//     }

//   );

//   return btoa(String.fromCharCode(...new Uint8Array(encryptedSharedKey)));
// };

export const encryptPrivateKey = async (
  jwkPrivateKey: JsonWebKey,
  masterKey: CryptoKey,
) => {
  const iv = crypto.getRandomValues(new Uint8Array(16));
  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    jwkPrivateKey,
    {
      name:"ECDH",
      namedCurve:'P-256',
    },
    true,
    ['deriveKey','deriveBits']
  )
  // const encryptedPrivateKey = await window.crypto.subtle.encrypt(
  //   {
  //     name: "AES-GCM",
  //     length: 256,
  //     iv: iv,
  //   },
  //   masterKey,
  //   privateKey,
  // );
  const encryptedPrivateKey = await window.crypto.subtle.wrapKey(
    'jwk',
    privateKey,
    masterKey,
    {
      name:"AES-GCM",
      length:256,
      iv:iv,
    }
  )
  return {
    encryptedPrivateKey: btoa(
      String.fromCharCode(...new Uint8Array(encryptedPrivateKey)),
    ),
    iv: btoa(String.fromCharCode(...new Uint8Array(iv))),
  };
};

export const decryptEncryptedPrivate = async(encryptedPrivateKey:string, password:string, salt:string, iv:string) => {
  const saltBuffer = Uint8Array.from(atob(salt), (c) => c.charCodeAt(0));
  const privateKeyArrayBuffer = Uint8Array.from(atob(encryptedPrivateKey), (c) => c.charCodeAt(0));
  const { masterKey } = await generateKeyFromPassword(password, saltBuffer);
  const ivBuffer = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));
  // const decryptedPrivateKey = await window.crypto.subtle.u(
  //   {
  //     name:"AES-GCM",
  //     length:256,
  //     iv:ivBuffer
  //   },
  //   masterKey,
  //   privateKeyArrayBuffer
  // )
  // const importprivateKey = await window.crypto.subtle.importKey(
  //   'pkcs8',
  //   decryptedPrivateKey,
  //   {
  //     name:"ECDH",
  //     namedCurve:"P-256"
  //   },
  //   true,
  //   ['deriveKey']
  // )
  const decryptedPrivateKey= await window.crypto.subtle.unwrapKey(
    'jwk',
    privateKeyArrayBuffer,
    masterKey,
    {
      name:"AES-GCM",
      length:256,
      iv:ivBuffer
    },{
      name:"ECDH",
      namedCurve:'P-256'
    },
    true,
    ['deriveKey', 'deriveBits']
  )
  return decryptedPrivateKey
}

// export const getSharedKey = async (
//   userId: string,
// ): Promise<{ rawSharedKey: CryptoKey; encryptedSharedKeyString: string }> => {
//   return new Promise((resolve, reject) => {
//     const req = indexedDB.open(DB_NAME, DB_VR);
//     req.onsuccess = () => {
//       const db = req.result;
//       const transaction = db.transaction("sharedKey", "readwrite");
//       const store = transaction.objectStore("sharedKey").get(userId);
//       store.onsuccess = () =>
//         resolve({
//           rawSharedKey: store.result?.rawSharedKey,
//           encryptedSharedKeyString: store.result?.encryptedSharedKey,
//         });
//     };
//     req.onerror = () => {
//       console.log("Failed retrieve sharedKey");
//       reject(req.error);
//     };
//   });
// };

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

export const decryptMessage = async (
  message: any,
  sharedSecret:CryptoKey,
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
