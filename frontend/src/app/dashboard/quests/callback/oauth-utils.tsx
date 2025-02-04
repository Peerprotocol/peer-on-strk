// oauth-utils.ts
export function generateCodeVerifier() {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return base64URLEncode(array);
  }
  
  export async function generateCodeChallenge(verifier: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return base64URLEncode(new Uint8Array(digest));
  }
  
  function base64URLEncode(buffer: Uint8Array) {
    return btoa(String.fromCharCode(...Array.from(buffer)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }