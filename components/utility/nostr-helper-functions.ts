import * as CryptoJS from "crypto-js";
import { finalizeEvent, nip04, nip19, nip98, SimplePool } from "nostr-tools";
import axios from "axios";
import { NostrEvent } from "@/pages/types";
import { ProductFormValues } from "@/pages/api/nostr/post-event";

export async function PostListing(
  values: ProductFormValues,
  passphrase: string,
) {
  const { signIn, encryptedPrivateKey, decryptedNpub, relays } =
    getLocalStorageData();
  const summary = values.find(([key]) => key === "summary")?.[1] || "";

  const dValue = values.find(([key]) => key === "d")?.[1] || undefined;

  const created_at = Math.floor(Date.now() / 1000);
  // Add "published_at" key
  const updatedValues = [...values, ["published_at", String(created_at)]];

  if (signIn === "extension") {
    const event = {
      created_at: created_at,
      kind: 30402,
      // kind: 30018,
      tags: updatedValues,
      content: summary,
    };

    const recEvent = {
      kind: 31989,
      tags: [
        ["d", "30402"],
        [
          "a",
          "31990:" + decryptedNpub + ":" + dValue,
          "wss://relay.damus.io",
          "web",
        ],
      ],
      content: "",
      created_at: Math.floor(Date.now() / 1000),
    };

    const handlerEvent = {
      kind: 31990,
      tags: [
        ["d", dValue],
        ["k", "30402"],
        ["web", "https://shopstr.store/<bech-32>", "npub"],
      ],
      content: "",
      created_at: Math.floor(Date.now() / 1000),
    };

    const signedEvent = await window.nostr.signEvent(event);
    const signedRecEvent = await window.nostr.signEvent(recEvent);
    const signedHandlerEvent = await window.nostr.signEvent(handlerEvent);

    const pool = new SimplePool();

    await Promise.any(pool.publish(relays, signedEvent));
    await Promise.any(pool.publish(relays, signedRecEvent));
    await Promise.any(pool.publish(relays, signedHandlerEvent));
    return signedEvent;
  } else {
    const res = await axios({
      method: "POST",
      url: "/api/nostr/post-event",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        pubkey: decryptedNpub,
        privkey: getPrivKeyWithPassphrase(passphrase),
        created_at: created_at,
        kind: 30402,
        // kind: 30018,
        tags: updatedValues,
        content: summary,
        relays: relays,
      },
    });
    return {
      id: res.data.id,
      pubkey: decryptedNpub,
      created_at: created_at,
      kind: 30402,
      tags: updatedValues,
      content: summary,
    };
  }
}

interface EncryptedMessageEvent {
  pubkey: string;
  created_at: number;
  content: string;
  kind: number;
  tags: string[][];
}

export async function constructEncryptedMessageEvent(
  senderPubkey: string,
  message: string,
  recipientPubkey: string,
  passphrase?: string,
): Promise<EncryptedMessageEvent> {
  let encryptedContent = "";
  let signInMethod = getLocalStorageData().signIn;
  if (signInMethod === "extension") {
    encryptedContent = await window.nostr.nip04.encrypt(
      recipientPubkey,
      message,
    );
  } else if (signInMethod === "nsec") {
    if (!passphrase) {
      throw new Error("Passphrase is required");
    }
    let senderPrivkey = getPrivKeyWithPassphrase(passphrase) as Uint8Array;
    encryptedContent = await nip04.encrypt(
      senderPrivkey,
      recipientPubkey,
      message,
    );
  }
  let encryptedMessageEvent = {
    pubkey: senderPubkey,
    created_at: Math.floor(Date.now() / 1000),
    content: encryptedContent,
    kind: 4,
    tags: [["p", recipientPubkey]],
  };
  return encryptedMessageEvent;
}

export async function sendEncryptedMessage(
  encryptedMessageEvent: EncryptedMessageEvent,
  passphrase?: string,
) {
  const { signIn, relays } = getLocalStorageData();
  let signedEvent;
  if (signIn === "extension") {
    signedEvent = await window.nostr.signEvent(encryptedMessageEvent);
  } else {
    if (!passphrase) throw new Error("Passphrase is required");
    let senderPrivkey = getPrivKeyWithPassphrase(passphrase) as Uint8Array;
    signedEvent = finalizeEvent(encryptedMessageEvent, senderPrivkey);
  }
  const pool = new SimplePool();
  await Promise.any(pool.publish(relays, signedEvent));
}

export async function finalizeAndSendNostrEvent(
  nostrEvent: NostrEvent,
  passphrase?: string,
) {
  const { signIn, relays } = getLocalStorageData();
  let signedEvent;
  if (signIn === "extension") {
    signedEvent = await window.nostr.signEvent(nostrEvent);
  } else {
    if (!passphrase) throw new Error("Passphrase is required");
    let senderPrivkey = getPrivKeyWithPassphrase(passphrase) as Uint8Array;
    signedEvent = finalizeEvent(nostrEvent, senderPrivkey);
  }
  const pool = new SimplePool();
  await Promise.any(pool.publish(relays, signedEvent));
}

type NostrBuildResponse = {
  status: "success" | "error";
  message: string;
  data: [
    {
      input_name: "APIv2";
      name: string;
      url: string;
      thumbnail: string;
      responsive: {
        "240p": string;
        "360p": string;
        "480p": string;
        "720p": string;
        "1080p": string;
      };
      blurhash: string;
      sha256: string;
      type: "picture" | "video";
      mime: string;
      size: number;
      metadata: Record<string, string>;
      dimensions: {
        width: number;
        height: number;
      };
    },
  ];
};

export type DraftNostrEvent = Omit<NostrEvent, "pubkey" | "id" | "sig">;

export async function nostrBuildUploadImage(
  image: File,
  sign?: (draft: DraftNostrEvent) => Promise<NostrEvent>,
) {
  if (!image.type.includes("image"))
    throw new Error("Only images are supported");

  const url = "https://nostr.build/api/v2/upload/files";

  const payload = new FormData();
  payload.append("fileToUpload", image);

  const headers: HeadersInit = {};
  if (sign) {
    // @ts-ignore
    const token = await nip98.getToken(url, "POST", sign, true);
    headers.Authorization = token;
  }

  const response = await fetch(url, {
    body: payload,
    method: "POST",
    headers,
  }).then((res) => res.json() as Promise<NostrBuildResponse>);

  return response.data[0];
}

/***** HELPER FUNCTIONS *****/

// function to validate public and private keys
export function validateNPubKey(publicKey) {
  const validPubKey = /^npub[a-zA-Z0-9]{59}$/;
  return publicKey.match(validPubKey) !== null;
}
export function validateNSecKey(privateKey) {
  const validPrivKey = /^nsec[a-zA-Z0-9]{59}$/;
  return privateKey.match(validPrivKey) !== null;
}

function sha256Hex(string) {
  const utf8 = new TextEncoder().encode(string);

  return crypto.subtle.digest("SHA-256", utf8).then((hashBuffer) => {
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((bytes) => bytes.toString(16).padStart(2, "0"))
      .join("");

    return hashHex;
  });
}

export async function generateNostrEventId(msg) {
  const digest = [
    0,
    msg.pubkey,
    msg.created_at,
    msg.kind,
    msg.tags,
    msg.content,
  ];
  const digest_str = JSON.stringify(digest);
  const hash = await sha256Hex(digest_str);

  return hash;
}

export function validPassphrase(passphrase: string) {
  try {
    let nsec = getNsecWithPassphrase(passphrase);
    if (!nsec) return false; // invalid passphrase
  } catch (e) {
    return false; // invalid passphrase
  }
  return true; // valid passphrase
}

export function getNsecWithPassphrase(passphrase: string) {
  if (!passphrase) return undefined;
  const { encryptedPrivateKey } = getLocalStorageData();
  let nsec = CryptoJS.AES.decrypt(encryptedPrivateKey, passphrase).toString(
    CryptoJS.enc.Utf8,
  );
  // returns undefined or "" thanks to the toString method
  return nsec;
}

export function getPrivKeyWithPassphrase(passphrase: string) {
  let { data } = nip19.decode(getNsecWithPassphrase(passphrase));
  return data;
}

export interface LocalStorageInterface {
  signIn: string; // extension or nsec
  encryptedPrivateKey: string;
  npub: string;
  decryptedNpub: string;
  relays: string[];
  mints: string[];
}

export const getLocalStorageData = (): LocalStorageInterface => {
  let signIn;
  let encryptedPrivateKey;
  let npub;
  let decryptedNpub;
  let relays;
  let mints;

  if (typeof window !== "undefined") {
    npub = localStorage.getItem("npub");
    if (npub) {
      const { data } = nip19.decode(npub);
      decryptedNpub = data;
    }

    encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");

    signIn = localStorage.getItem("signIn");

    relays = localStorage.getItem("relays");

    const defaultRelays = [
      "wss://relay.damus.io",
      "wss://nos.lol",
      "wss://nostr.mutinywallet.com",
    ];

    if (!relays) {
      relays = defaultRelays;
    } else {
      try {
        relays = (JSON.parse(relays) as string[]).filter((r) => r);
      } catch {
        relays = defaultRelays;
      }
    }
    localStorage.setItem("relays", JSON.stringify(relays));

    mints = localStorage.getItem("mints")
      ? JSON.parse(localStorage.getItem("mints") as string)
      : null;

    if (
      mints === null ||
      mints[0] ===
        "https://legend.lnbits.com/cashu/api/v1/4gr9Xcmz3XEkUNwiBiQGoC"
    ) {
      mints = ["https://legend.lnbits.com/cashu/api/v1/AptDNABNBXv8gpuywhx6NV"];
      localStorage.setItem("mints", JSON.stringify(mints));
    }
  }
  return {
    signIn: signIn as string,
    encryptedPrivateKey: encryptedPrivateKey as string,
    npub: npub as string,
    decryptedNpub: decryptedNpub as string,
    relays,
    mints,
  };
};

export const decryptNpub = (npub: string) => {
  const { data } = nip19.decode(npub);
  return data;
};

export function nostrExtensionLoaded() {
  if (!window.nostr) {
    return false;
  }
  return true;
}