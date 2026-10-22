import { generateSecret, generateURI, verifySync } from 'otplib'
import QRCode from 'qrcode'

export interface TotpSetupData {
  secret: string
  qrCodeUrl: string
}

export function generateTotpSecret(): string {
  return generateSecret()
}

export async function createTotpSetupData(label: string, secret?: string): Promise<TotpSetupData> {
  const totpSecret = secret || generateTotpSecret()
  const otpauthUri = generateURI({
    issuer: 'SQL Compass',
    label,
    secret: totpSecret,
  })

  const qrCodeUrl = await QRCode.toDataURL(otpauthUri)
  return { secret: totpSecret, qrCodeUrl }
}

export function verifyTotpCode(
  code: string,
  secret: string,
  lastTotpUsed?: string
): boolean {
  const normalizedCode = (code || '').trim()

  if (!/^\d{6}$/.test(normalizedCode)) {
    throw new Error('Authentication code must be a 6-digit number')
  }

  if (lastTotpUsed && lastTotpUsed === normalizedCode) {
    throw new Error('This authenticator code was already used. Please wait for the next code.')
  }

  const result = verifySync({
    token: normalizedCode,
    secret,
  })

  return !!result.valid
}
