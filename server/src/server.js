import "dotenv/config";
import app from "./app.js";
import config from "./config/index.js";
import connectDb from "./config/db/index.js";

connectDb().then(() => {
  app.listen(config.config.port, () => {
    console.log(`Server is running on port ${config.config.port}`);
  });
});

process.on("SIGTERM", () => process.exit(0));
process.on("SIGINT", () => process.exit(0));
process.on("uncaughtException", (err) => {
  console.error(`Uncaught Exception =>`, err);
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  console.error(`Unhandled Rejection =>`, reason);
  process.exit(1);
});
