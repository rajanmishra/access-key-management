import { randomBytes, createHmac } from 'crypto';

export function generateRandomString(userId: string, length: number): string {
  const randomPart = randomBytes(length)
    .toString('base64')
    .slice(0, length)
    .replace(/\+/g, '0')
    .replace(/\//g, '0');

  const hmac = createHmac('sha256', userId);
  hmac.update(randomPart);

  return hmac.digest('hex').slice(0, length);
}
