import redisClient from "../config/redis.js";

const clearCache = async (patterns) => {
  try {
    for (const pattern of patterns) {
      const stream = redisClient.scanStream({
        match: pattern,
        count: 100,
      });

      for await (const keys of stream) {
        if (keys && keys.length > 0) {
          await redisClient.del(...keys);
        }
      }
    }

    console.log("Redis cache invalidated successfully");
  } catch (error) {
    console.error("Cache invalidation error:", error);
  }
};

export default clearCache;
