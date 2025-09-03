/**
 * Base44 encoding implementation for TravelHub
 * Uses a 44-character alphabet for URL-safe, human-readable codes
 */

const BASE44_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789BCDEFGHJK';
const BASE = 44;

/**
 * Encodes a number to Base44 string
 */
function encodeNumber(num: number): string {
  if (num === 0) return BASE44_ALPHABET[0];
  
  let result = '';
  while (num > 0) {
    result = BASE44_ALPHABET[num % BASE] + result;
    num = Math.floor(num / BASE);
  }
  return result;
}

/**
 * Decodes a Base44 string to number
 */
function decodeNumber(str: string): number {
  let result = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const value = BASE44_ALPHABET.indexOf(char);
    if (value === -1) {
      throw new Error(`Invalid Base44 character: ${char}`);
    }
    result = result * BASE + value;
  }
  return result;
}

/**
 * Generates a unique Base44 booking code
 */
export function generateBookingCode(): string {
  // Use timestamp and random number for uniqueness
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 100000);
  const combined = timestamp * 100000 + random;
  
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
  return /^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]+$/.test(str);
}

/**
 * Decodes a booking code to extract timestamp
 */
export function decodeBookingCode(code: string): { timestamp: number; random: number } | null {
  try {
    if (!code.startsWith('TH-')) return null;
    
    const encoded = code.substring(3);
    const decoded = decodeNumber(encoded);
    
    const timestamp = Math.floor(decoded / 100000);
    const random = decoded % 100000;
    
    return { timestamp, random };
  } catch {
    return null;
  }
}
