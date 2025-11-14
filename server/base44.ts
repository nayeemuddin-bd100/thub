/**
 * Base42 encoding implementation for TravelHub
 * Uses a 42-character alphabet for URL-safe, human-readable codes
 * Excludes visually confusing characters: 0, 1, I, O, i
 */

const BASE44_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789abcdefghjk';
const BASE = 42;

/**
 * Encodes a number to Base42 string
 */
function encodeNumber(num: number | bigint): string {
  let n = typeof num === 'bigint' ? num : BigInt(num);
  if (n === BigInt(0)) return BASE44_ALPHABET[0];
  
  let result = '';
  const base = BigInt(BASE);
  while (n > BigInt(0)) {
    result = BASE44_ALPHABET[Number(n % base)] + result;
    n = n / base;
  }
  return result;
}

/**
 * Decodes a Base42 string to bigint
 */
function decodeToBigInt(str: string): bigint {
  let result = BigInt(0);
  const base = BigInt(BASE);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE44_ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error(`Invalid Base42 character: ${char}`);
    }
    result = result * base + BigInt(value);
  }
  return result;
}

/**
 * Generates a unique Base42 booking code
 */
export function generateBookingCode(): string {
  // Use timestamp and random number for uniqueness
  // Using BigInt to avoid precision loss
  const timestamp = BigInt(Date.now());
  const random = BigInt(Math.floor(Math.random() * 1000000)); // Increased from 100k to 1M for better uniqueness
  const combined = timestamp * BigInt(1000000) + random;
  
  const encoded = encodeNumber(combined);
  return `TH-${encoded}`;
}

/**
 * Generates a Base44 property ID
 */
export function generatePropertyCode(propertyId: string): string {
  // Convert UUID to a number representation
  const hash = propertyId.replace(/-/g, '').substring(0, 12);
  const num = parseInt(hash, 16);
  return `P-${encodeNumber(num)}`;
}

/**
 * Generates a Base44 service provider ID
 */
export function generateServiceCode(serviceId: string): string {
  const hash = serviceId.replace(/-/g, '').substring(0, 12);
  const num = parseInt(hash, 16);
  return `S-${encodeNumber(num)}`;
}

/**
 * Generates a Base44 access code for property entry
 */
export function generateAccessCode(): string {
  const random = Math.floor(Math.random() * 1000000000);
  return encodeNumber(random);
}

/**
 * Validates a Base44 string
 */
export function validateBase44(str: string): boolean {
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjk23456789]+$/.test(str);
}

/**
 * Decodes a booking code to extract timestamp and random number
 */
export function decodeBookingCode(code: string): { timestamp: number; random: number } | null {
  try {
    if (!code.startsWith('TH-')) return null;
    
    const encoded = code.substring(3);
    const decoded = decodeToBigInt(encoded);
    
    const timestamp = Number(decoded / BigInt(1000000));
    const random = Number(decoded % BigInt(1000000));
    
    return { timestamp, random };
  } catch {
    return null;
  }
}
