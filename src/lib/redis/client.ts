import Redis from 'ioredis';

if (!process.env.REDIS_URL) {
  throw new Error('REDIS_URL is not defined');
}

const redis = new Redis(process.env.REDIS_URL);

export default redis;

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  ANALYTICS_RESULT: 3600, // 1 hour
  CHAT_SESSION: 86400,    // 24 hours
  RATE_LIMIT: 60,         // 1 minute
};

// Cache key prefixes
export const CACHE_KEYS = {
  ANALYTICS: 'analytics:',
  CHAT_SESSION: 'chat:',
  RATE_LIMIT: 'ratelimit:',
}; 