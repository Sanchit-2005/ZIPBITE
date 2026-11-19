import redisClient from "../config/redis.js";
import asyncWrapper from "../asyncWrap.js";
const cacheMiddleware = asyncWrapper(async (req, res, next) => {
  const key = `cache:${req.originalUrl}`; //cache+query url

  try {
    const cachedData = await redisClient.get(key);

    if (cachedData) {
      res.set("Cache", "hit");
      console.log("hit the cache ");
      return res.json(JSON.parse(cachedData));
    }

    console.log("new query hit ");
    const originalJson = res.json.bind(res); //store original controllers  backend side responce
    res.json = (data) => {
      // Cache only successful responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const CACHE_TTL_SECONDS = 300;
        redisClient
          .setEx(key, CACHE_TTL_SECONDS, JSON.stringify(data))
          .catch((err) => {
            console.error("Cache save error:", err);
          });
      }

      res.set("X-Cache", "MISS");
      return originalJson(data);
    };

    next();
  } catch (err) {
    console.log(err);
  }
});

export default cacheMiddleware;
