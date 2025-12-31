
/**
 * CipherNet Crypto Service
 * Uses AES-GCM (256-bit) with PBKDF2 key derivation.
 * Key is derived from: Shared Secret + (Sender ID + Receiver ID) as salt.
 */

export const cryptoService = {
  // Generates a unique 32-character ID
  generateIdentity(): string {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  },

  // Derive a unique key bound to these specific two IDs and the password
  async deriveKey(password: string, idA: string, idB: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    
    // Sort IDs alphabetically so both parties generate the exact same salt regardless of who is sender/receiver
    const participants = [idA, idB].sort().join(':');
    const salt = encoder.encode(`CipherNet-v1:${participants}`);

    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 150000, // Higher iterations for better security
        hash: 'SHA-256'
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },

  async encrypt(text: string, password: string, myId: string, peerId: string): Promise<{ encrypted: string; iv: string }> {
    const key = await this.deriveKey(password, myId, peerId);
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return {
      encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
      iv: btoa(String.fromCharCode(...iv))
    };
  },

  async decrypt(encryptedBase64: string, ivBase64: string, password: string, myId: string, peerId: string): Promise<string> {
    try {
      const key = await this.deriveKey(password, myId, peerId);
      const iv = new Uint8Array(atob(ivBase64).split('').map(c => c.charCodeAt(0)));
      const encryptedData = new Uint8Array(atob(encryptedBase64).split('').map(c => c.charCodeAt(0)));

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encryptedData
      );

      return new TextDecoder().decode(decrypted);
    } catch (e) {
      return "[DECRYPTION_FAILED]";
    }
  }
};
