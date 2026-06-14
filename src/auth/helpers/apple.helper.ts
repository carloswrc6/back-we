// import * as jwksClient from 'jwks-rsa';
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
});

const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) callback(err, null);
    else callback(null, key.getPublicKey());
  });
};

export const verifyAppleToken = (idToken: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      idToken,
      getKey,
      {
        algorithms: ['RS256'],
        issuer: 'https://appleid.apple.com',
        audience: process.env.APPLE_CLIENT_ID,
      },
      (err, decoded) => {
        if (err) reject(new Error('Invalid Apple token'));
        else resolve(decoded);
      },
    );
  });
};