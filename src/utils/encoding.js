
// Map from Unicode characters (produced by interpreting Windows-1252 bytes)
// back to their original byte values.
const WIN1252_TO_BYTE = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84,
  '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87, '\u02C6': 0x88,
  '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C,
  '\u017D': 0x8E, '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93,
  '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B,
  '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F
};

/**
 * Attempts to fix strings that are Mojibake (UTF-8 bytes interpreted as Windows-1252).
 * Example: "Ã”" (U+00C3, U+201D) -> "Ô" (U+00D4)
 *
 * Strategy:
 * 1. Convert the string characters back to bytes.
 *    - For chars < 256, use code point directly.
 *    - For chars in Windows-1252 extended range (0x80-0x9F), use the mapping.
 *    - If any char is outside these ranges and not in the map, assume the string is NOT Mojibake (already correct Unicode).
 * 2. Try to decode the resulting bytes as UTF-8.
 *    - If successful, return the decoded string.
 *    - If invalid UTF-8 (e.g. fatal error), assume original string was correct (e.g. Latin1 text that isn't UTF-8).
 */
export function fixMojibake(str) {
  if (!str) return str;

  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const code = char.charCodeAt(0);
    if (code < 256) {
      bytes[i] = code;
    } else {
      const byte = WIN1252_TO_BYTE[char];
      if (byte !== undefined) {
        bytes[i] = byte;
      } else {
        // Character is > 255 and NOT a result of Windows-1252 decoding.
        return str;
      }
    }
  }

  try {
    // Use fatal: true so that invalid sequences throw instead of producing replacement chars.
    const decoder = new TextDecoder('utf-8', { fatal: true });
    return decoder.decode(bytes);
  } catch (e) {
    // The bytes do not form valid UTF-8. Return original string.
    return str;
  }
}

/**
 * Recursively applies fixMojibake to all strings in an object or array.
 */
export function recursiveFixMojibake(data) {
  if (typeof data === 'string') {
    return fixMojibake(data);
  }
  if (Array.isArray(data)) {
    return data.map(item => recursiveFixMojibake(item));
  }
  if (data !== null && typeof data === 'object') {
    const newData = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newData[key] = recursiveFixMojibake(data[key]);
      }
    }
    return newData;
  }
  return data;
}
