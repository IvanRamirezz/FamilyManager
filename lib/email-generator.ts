export function normalizeEmail(email: string) {
  const [local, domain] = email.split("@");

  const cleanLocal = local
    .replace(/\\./g, "")
    .split("+")[0];

  return `${cleanLocal}@${domain}`.toLowerCase();
}

export function generateEmailVariants(
  baseEmail: string
) {
  const [local, domain] =
    normalizeEmail(baseEmail).split("@");

  const variants = new Set<string>();

  for (let i = 1; i < local.length; i++) {
    const variant =
      local.slice(0, i) +
      "." +
      local.slice(i);

    variants.add(`${variant}@${domain}`);
  }

  return Array.from(variants);
}

export function findAvailableVariant(
  baseEmail: string,
  usedEmails: string[]
) {
  const variants =
    generateEmailVariants(baseEmail);

  return variants.find(
    (variant) => !usedEmails.includes(variant)
  );
}