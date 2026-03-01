const GID_LENGTH = 10;

export function sanitizeGid(value: unknown) {
  return String(value ?? "").replace(/\D+/g, "");
}

export function isValidGid(value: unknown) {
  return sanitizeGid(value).length === GID_LENGTH;
}

export function normalizeGid(value: unknown) {
  const digits = sanitizeGid(value);
  return digits.length === GID_LENGTH ? digits : null;
}

export function hasGidValue(value: unknown) {
  return normalizeGid(value) !== null;
}

export const GID_RULE_MESSAGE = "GID phải gồm đúng 10 chữ số.";
