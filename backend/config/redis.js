import "../env.js";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const redisClient = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

redisClient.on("connect", () => {
  console.log("Redis connecting...");
});

redisClient.on("ready", () => {
  console.log("Redis connected successfully!");
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

export default redisClient;
