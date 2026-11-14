export interface StoredAdminBiometric {
  id: string;
  rawId: string;
  email: string;
  registeredAt: string;
}

const BIOMETRIC_STORAGE_KEY = 'vsc_admin_biometric_cred';
const SAVED_EMAIL_KEY = 'vsc_admin_saved_email';

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(base64Url: string): ArrayBuffer {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function isBiometricSupported(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.isSecureContext || !('PublicKeyCredential' in window)) {
    return false;
  }

  try {
    const pkc = PublicKeyCredential as unknown as {
      getClientCapabilities?: () => Promise<Record<string, boolean>>;
      isUserVerifyingPlatformAuthenticatorAvailable?: () => Promise<boolean>;
    };

    if (typeof pkc.getClientCapabilities === 'function') {
      const caps = await pkc.getClientCapabilities();
      if (caps.passkeyPlatformAuthenticator || caps.userVerifyingPlatformAuthenticator) {
        return true;
      }
    }

    if (typeof pkc.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await pkc.isUserVerifyingPlatformAuthenticatorAvailable();
    }
  } catch {
    return false;
  }

  return false;
}

export function getStoredAdminBiometric(): StoredAdminBiometric | null {
  try {
    const raw = localStorage.getItem(BIOMETRIC_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredAdminBiometric;
    if (!parsed?.id || !parsed?.rawId || !parsed?.email) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getSavedAdminEmail(): string {
  const bio = getStoredAdminBiometric();
  if (bio?.email) return bio.email;
  try {
    return localStorage.getItem(SAVED_EMAIL_KEY) || '';
  } catch {
    return '';
  }
}

export function saveAdminEmail(email: string): void {
  try {
    localStorage.setItem(SAVED_EMAIL_KEY, email.trim().toLowerCase());
  } catch {
    // ignore storage errors
  }
}

export function clearAdminBiometric(): void {
  try {
    localStorage.removeItem(BIOMETRIC_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

export async function registerAdminBiometric(
  email: string
): Promise<{ ok: boolean; message: string }> {
  const supported = await isBiometricSupported();
  if (!supported) {
    return {
      ok: false,
      message: 'Biometria do aparelho não disponível neste navegador ou conexão.'
    };
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const cleanEmail = email.trim().toLowerCase();
    const userId = new TextEncoder().encode(`vsc-admin:${cleanEmail}`);

    const credential = (await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'VASCONCELOS Gestão',
          id: window.location.hostname
        },
        user: {
          id: userId,
          name: cleanEmail,
          displayName: 'Administrador VASCONCELOS'
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 }
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          residentKey: 'preferred',
          requireResidentKey: false,
          userVerification: 'required'
        },
        timeout: 60000,
        attestation: 'none'
      }
    })) as PublicKeyCredential | null;

    if (!credential) {
      return { ok: false, message: 'Cadastro biométrico cancelado.' };
    }

    const stored: StoredAdminBiometric = {
      id: credential.id,
      rawId: bufferToBase64Url(credential.rawId),
      email: cleanEmail,
      registeredAt: new Date().toISOString()
    };

    localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(stored));
    saveAdminEmail(cleanEmail);

    return {
      ok: true,
      message: 'Biometria do aparelho salva com sucesso!'
    };
  } catch (err) {
    const error = err as DOMException;
    if (error?.name === 'NotAllowedError') {
      return { ok: false, message: 'Confirmação biométrica cancelada ou expirada.' };
    }
    if (error?.name === 'InvalidStateError') {
      return { ok: false, message: 'Este aparelho já possui biometria cadastrada.' };
    }
    if (error?.name === 'SecurityError') {
      return { ok: false, message: 'A biometria exige conexão segura (HTTPS).' };
    }
    return {
      ok: false,
      message: 'Não foi possível salvar a biometria neste aparelho.'
    };
  }
}

export async function authenticateWithAdminBiometric(): Promise<{
  ok: boolean;
  email?: string;
  message: string;
}> {
  const stored = getStoredAdminBiometric();
  if (!stored) {
    return {
      ok: false,
      message: 'Nenhuma biometria cadastrada neste aparelho. Entre com e-mail e senha para ativar.'
    };
  }

  const supported = await isBiometricSupported();
  if (!supported) {
    return {
      ok: false,
      message: 'Biometria não suportada neste navegador.'
    };
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);
    const expectedChallenge = bufferToBase64Url(challenge.buffer);

    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [
          {
            type: 'public-key',
            id: base64UrlToBuffer(stored.rawId),
            transports: ['internal']
          }
        ],
        userVerification: 'required',
        timeout: 60000
      }
    })) as PublicKeyCredential | null;

    if (!assertion || assertion.id !== stored.id) {
      return { ok: false, message: 'Credencial biométrica não reconhecida.' };
    }

    const response = assertion.response as AuthenticatorAssertionResponse;
    const clientData = JSON.parse(new TextDecoder().decode(response.clientDataJSON)) as {
      type?: string;
      challenge?: string;
      origin?: string;
    };

    if (
      clientData.type !== 'webauthn.get' ||
      clientData.challenge !== expectedChallenge ||
      clientData.origin !== window.location.origin
    ) {
      return { ok: false, message: 'Falha na validação de segurança da biometria.' };
    }

    const authFlags = new Uint8Array(response.authenticatorData)[32] ?? 0;
    const userPresent = (authFlags & 0x01) !== 0;
    const userVerified = (authFlags & 0x04) !== 0;
    if (!userPresent || !userVerified) {
      return { ok: false, message: 'Verificação biométrica do usuário não confirmada.' };
    }

    return {
      ok: true,
      email: stored.email,
      message: 'Autenticado via biometria do aparelho!'
    };
  } catch (err) {
    const error = err as DOMException;
    if (error?.name === 'NotAllowedError') {
      return { ok: false, message: 'Leitura biométrica cancelada pelo usuário.' };
    }
    if (error?.name === 'AbortError') {
      return { ok: false, message: 'Autenticação biométrica interrompida.' };
    }
    return {
      ok: false,
      message: 'Erro ao validar a biometria. Entre com seu e-mail e senha.'
    };
  }
}
