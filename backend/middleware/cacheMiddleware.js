import redisClient from "../config/redis.js";
import asyncWrapper from "../asyncWrap.js";

const cacheMiddleware = asyncWrapper(async (req, res, next) => {
  const key = `cache:${req.originalUrl}`;

  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      res.set("X-Cache", "HIT");
      console.log("Hit the cache");
      return res.json(JSON.parse(cachedData));
    }

    console.log("New query hit");

    const originalJson = res.json.bind(res);

    res.json = (data) => {
      // Cache only successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const CACHE_TTL_SECONDS = 300;

        redisClient
          .set(key, JSON.stringify(data), "EX", CACHE_TTL_SECONDS)
          .catch((err) => {
            console.warn("Cache save skipped:", err.message);
          });
      }

      res.set("X-Cache", "MISS");
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.warn("Cache skipped because Redis is unavailable:", err.message);
    res.set("X-Cache", "BYPASS");
    next(); // Continue to controller and fetch from MongoDB
  }
});

export default cacheMiddleware;
