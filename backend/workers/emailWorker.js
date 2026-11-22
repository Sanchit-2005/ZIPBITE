import "../env.js";
import { Worker } from "bullmq";
import IORedis from "ioredis";
import transporter from "../config/email.js";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const connection = new IORedis(redisUrl, {
  maxRetriesPerRequest: null,
});

const emailWorker = new Worker(
  "email-queue",
  async (job) => {
    console.log("Processing email job:", job.id, job.name);

    const { to, subject, message } = job.data;

    if (!to) {
      throw new Error("Recipient email ('to') is missing in job data");
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    });

    console.log("Email sent successfully to:", to);
  },
  {
    connection,
  },
);

emailWorker.on("ready", () => {
  console.log("BullMQ Email Worker is ready and connected to Redis!");
});

emailWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully!`);
});

emailWorker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message);
});

emailWorker.on("error", (err) => {
  console.error("BullMQ Worker internal error:", err);
});

export default emailWorker;
