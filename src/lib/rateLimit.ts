// src/lib/rateLimit.ts
// Rate limiter en mémoire (mono-instance). À migrer vers Redis si l'app tourne sur plusieurs instances.

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

// Nettoyage périodique pour éviter une fuite mémoire (toutes les 10 min)
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 10 * 60 * 1000);

/**
 * Vérifie et incrémente un compteur pour une clé donnée.
 * @param key Identifiant unique (ex: "login:email:ip")
 * @param limit Nombre maximal de tentatives autorisées
 * @param windowMs Durée de la fenêtre en millisecondes
 * @returns { allowed: boolean, remaining: number, retryAfterMs: number }
 */
export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, retryAfterMs: 0 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0, retryAfterMs: bucket.resetAt - now };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count, retryAfterMs: 0 };
}

/**
 * Extrait une adresse IP approximative depuis une requête Next.js.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'unknown-ip';
}
