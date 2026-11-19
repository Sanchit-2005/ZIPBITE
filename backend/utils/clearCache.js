import redisClient from "../config/redis.js";

const clearCache = async (patterns) => {
  try {
    for (const pattern of patterns) {
      for await (const key of redisClient.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      })) {
        await redisClient.del(key);
      }
    }

    console.log("Redis cache invalidated successfully");
  } catch (error) {
    
    console.error("Cache invalidation error:", error);
  }
};

export default clearCache;
