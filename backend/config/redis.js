import { createClient } from "redis";//This object contains methods that allow your application to communicate with your Redis database
import "../env.js";
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

redisClient.on("connect", () => {
  console.log("Connecting to Redis...");
});

redisClient.on("ready", () => {
  console.log("Redis connected successfully!");
});

export default redisClient;
