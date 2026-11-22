import redisClient from "../config/redis.js";

const rateLimiter = (limit = 5, windowSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const key = `rate-limit:${req.ip}`;

      const currentCount = await redisClient.incr(key);

      // Set expiry on first request, or if the key somehow has no TTL
      if (currentCount === 1 || (await redisClient.ttl(key)) === -1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (currentCount > limit) {
        const ttl = await redisClient.ttl(key);
        res.set("Retry-After", String(ttl));
        return res.status(429).json({
          success: false,
          message: "Too many requests. Please try again later.",
        });
      }

      next();
    } catch (err) {
      console.warn(
        "Rate limiter skipped because Redis is unavailable:",
        err.message,
      );
      next();
    }
  };
};

export default rateLimiter;
