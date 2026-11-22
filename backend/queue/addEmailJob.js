import emailQueue from "./emailQueue.js";

const addEmailJob = async (emailData) => {
  //email queue madhe add email navacha job enter honar
  await emailQueue.add("order-confirmation", emailData, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: {
      count: 100,
    },
  });
};

export default addEmailJob;
