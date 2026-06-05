import { OAuth2Client } from 'google-auth-library';

export const verifyGoogleToken = async (idToken: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error(
      'GOOGLE_CLIENT_ID is not configured in environment variables',
    );
  }

  const audienceEnv =
    process.env.GOOGLE_AUDIENCE || process.env.GOOGLE_CLIENT_ID;

  const audiences = audienceEnv
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (audiences.length === 0) {
    throw new Error(
      'GOOGLE_AUDIENCE or GOOGLE_CLIENT_ID must be configured in environment variables',
    );
  }

  const googleClient = new OAuth2Client(clientId);

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: audiences,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error('Invalid Google token payload');
    }

    return payload;
  } catch (error) {
    throw new Error(
      `Google token verification failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
};