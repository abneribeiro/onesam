import { scrypt, randomBytes, timingSafeEqual } from 'crypto';

const SALT_LENGTH = 32;
const KEY_LENGTH = 64;

function scryptAsync(password: string, salt: Buffer, keyLength: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, { N: 16384, r: 8, p: 1 }, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt.toString('hex')}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
  const [saltHex, keyHex] = hashedPassword.split(':');
  if (!saltHex || !keyHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const storedKey = Buffer.from(keyHex, 'hex');
  const derivedKey = await scryptAsync(inputPassword, salt, KEY_LENGTH);

  return timingSafeEqual(storedKey, derivedKey);
}
