import crypto from 'crypto';

export function hashPassword(rawPassword: string, salt?: string): { salt: string; hash: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(rawPassword, actualSalt, 100000, 32, 'sha256')
    .toString('hex');
  return { salt: actualSalt, hash };
}

export function verifyPassword(rawPassword: string, salt: string, expectedHash: string): boolean {
  if (!salt || !expectedHash) return false;
  const { hash } = hashPassword(rawPassword, salt);
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
  } catch {
    return hash === expectedHash;
  }
}
