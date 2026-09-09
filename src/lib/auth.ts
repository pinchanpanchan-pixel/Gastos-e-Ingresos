import { sha256Hex } from './utils'

export async function hashPin(pin: string): Promise<string> {
  return sha256Hex(`misfinanzas:${pin}`)
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return (await hashPin(pin)) === hash
}

export function biometricSupported(): boolean {
  return typeof window !== 'undefined' && !!window.PublicKeyCredential
}

const CREDENTIAL_ID_KEY = 'misfinanzas_webauthn_id'

export async function registerBiometric(): Promise<boolean> {
  if (!biometricSupported()) return false
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const userId = crypto.getRandomValues(new Uint8Array(16))
    const cred = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: { name: 'Mis Finanzas' },
        user: { id: userId, name: 'usuario', displayName: 'Usuario' },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }, { type: 'public-key', alg: -257 }],
        authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required' },
        timeout: 60000,
      },
    })) as PublicKeyCredential | null
    if (!cred) return false
    localStorage.setItem(CREDENTIAL_ID_KEY, cred.id)
    return true
  } catch {
    return false
  }
}

export async function verifyBiometric(): Promise<boolean> {
  if (!biometricSupported()) return false
  const id = localStorage.getItem(CREDENTIAL_ID_KEY)
  if (!id) return false
  try {
    const challenge = crypto.getRandomValues(new Uint8Array(32))
    const cred = await navigator.credentials.get({
      publicKey: {
        challenge,
        allowCredentials: [{ id: Uint8Array.from(atob(id.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0)), type: 'public-key' }],
        userVerification: 'required',
        timeout: 60000,
      },
    })
    return !!cred
  } catch {
    return false
  }
}

export function clearBiometric() {
  localStorage.removeItem(CREDENTIAL_ID_KEY)
}
