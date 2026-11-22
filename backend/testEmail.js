import "./env.js";
import addEmailJob from "./queue/addEmailJob.js"
const testEmail = async () => {
  await addEmailJob({
    to: "sanchitwakpanjar7@gmail.com",
    subject: "ZipBite Email Test",
    message: "Congratulations! Your BullMQ background email system is working.",
  });

  console.log("Email job added to queue!");
  process.exit(0);
};

testEmail();