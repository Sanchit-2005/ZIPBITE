import "../env.js";
import { Queue } from "bullmq";
import redisClient from "../config/redis.js";

const emailQueue = new Queue("email-queue", {
  connection: redisClient,
});

export default emailQueue;
