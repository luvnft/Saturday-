import * as CryptoJS from "crypto-js";
import { nip19, SimplePool } from "nostr-tools";
import { ProductFormValues } from "../api/post-event";
import axios from "axios";

export const getLocalStorageData = () => {
  let signIn;
  let encryptedPrivateKey;
  let decryptedNpub;
  let relays;

  if (typeof window !== "undefined") {
    const npub = localStorage.getItem("npub");
    const { data } = nip19.decode(npub);
    decryptedNpub = data;
    encryptedPrivateKey = localStorage.getItem("encryptedPrivateKey");
    signIn = localStorage.getItem("signIn");
    const storedRelays = localStorage.getItem("relays");
    relays = storedRelays ? JSON.parse(storedRelays) : [];
  }
  return { signIn, encryptedPrivateKey, decryptedNpub, relays };
};

export async function PostListing(
  values: ProductFormValues,
  passphrase: string
) {
  const { signIn, encryptedPrivateKey, decryptedNpub, relays } =
    getLocalStorageData();
  const summary = values.find(([key]) => key === "summary")?.[1] || "";

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

    const signedEvent = await window.nostr.signEvent(event);

    const pool = new SimplePool();

    // const relays = JSON.parse(storedRelays);

    // let sub = pool.sub(relays, [
    //   {
    //     kinds: [signedEvent.kind],
    //     authors: [signedEvent.pubkey],
    //   },
    // ]);

    // sub.on('event', (event) => {
    //   console.log('got event:', event);
    // });

    await pool.publish(relays, signedEvent);

    let events = await pool.list(relays, [{ kinds: [0, signedEvent.kind] }]);
    let postedEvent = await pool.get(relays, {
      ids: [signedEvent.id],
    });
  } else {
    let nsec = CryptoJS.AES.decrypt(encryptedPrivateKey, passphrase).toString(
      CryptoJS.enc.Utf8
    );
    // add error handling and re-prompt for passphrase
    let { data } = nip19.decode(nsec);
    axios({
      method: "POST",
      url: "/api/nostr/post-event",
      headers: {
        "Content-Type": "application/json",
      },
      data: {
        pubkey: decryptedNpub,
        privkey: data,
        created_at: created_at,
        kind: 30402,
        // kind: 30018,
        tags: updatedValues,
        content: summary,
        relays: relays,
      },
    });
  }
}

export async function createNostrDeleteEvent(
  event_ids,
  pubkey,
  content,
  privkey
) {
  let msg = {
    kind: 5, // NIP-X - Deletion
    content: content, // Deletion Reason
    tags: [],
  };

  for (let event_id of event_ids) {
    msg.tags.push(["e", event_id]);
  }

  // set msg fields
  msg.created_at = Math.floor(new Date().getTime() / 1000);
  msg.pubkey = pubkey;
  if (privkey) msg.privkey = privkey;

  // Generate event id
  msg.id = await generateNostrEventId(msg);

  return msg;
}

export function nostrExtensionLoaded() {
  if (!window.nostr) {
    return false;
  }
  return true;
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

async function generateNostrEventId(msg) {
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

// function to validate public and private keys
export function validateNPubKey(publicKey) {
  const validPubKey = /^npub[a-zA-Z0-9]{59}$/;
  return publicKey.match(validPubKey) !== null;
}
export function validateNSecKey(privateKey) {
  const validPrivKey = /^nsec[a-zA-Z0-9]{59}$/;
  return privateKey.match(validPrivKey) !== null;
}