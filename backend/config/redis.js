import "../env.js";

import IORedis from "ioredis";

const redisClient = new IORedis(process.env.REDIS_URL, {
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
