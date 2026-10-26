import { OAuth2Client } from 'google-auth-library'
import '../env.js'

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ''

const oauthClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)

export interface GoogleUserPayload {
  email: string
  name: string
  picture: string
  googleId: string
}

export function getGoogleAuthorizationUrl(redirectUri: string): string {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured in environment variables')
  }

  return oauthClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    redirect_uri: redirectUri,
    prompt: 'select_account',
  })
}

export async function verifyGoogleAuthorizationCode(
  code: string,
  redirectUri: string
): Promise<GoogleUserPayload> {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth is not configured on server (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)')
  }

  const { tokens } = await oauthClient.getToken({
    code,
    redirect_uri: redirectUri,
  })

  if (!tokens.id_token) {
    throw new Error('No id_token received from Google')
  }

  const ticket = await oauthClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: GOOGLE_CLIENT_ID,
  })

  const payload = ticket.getPayload()
  if (!payload || !payload.email) {
    throw new Error('Unable to extract user information from Google id_token')
  }

  if (!payload.email_verified) {
    throw new Error('Google account email is not verified')
  }

  return {
    email: payload.email.toLowerCase().trim(),
    name: payload.name || payload.email.split('@')[0],
    picture: payload.picture || '',
    googleId: payload.sub,
  }
}
