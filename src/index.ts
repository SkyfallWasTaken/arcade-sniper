import "dotenv/config";
import { chromium } from "playwright";
import executeContracts from "./contract";
import { getItems } from "./arcadeShop";
import chalk from "chalk";
import Cron from "croner";

const ARCADE_USER_ID = process.env.ARCADE_USER_ID;
const FILLOUT_SESSION_TOKEN = process.env.FILLOUT_SESSION_TOKEN;

console.log(`${chalk.green.bold("Launching")} browser`);
const browser = await chromium.launch();
const context = await browser.newContext();
context.addCookies([
  {
    name: "fillout_session_token__81_email",
    path: "/",
    value: FILLOUT_SESSION_TOKEN!,
    domain: "forms.hackclub.com",
  },
]);

console.log(`${chalk.green.bold("Loading")} page`);
const page = await context.newPage();
console.log(`${chalk.green.bold("Loaded")} page`);

Cron("*/5 * * * *", async () => {
  const items = await getItems();
  console.log(`Fetched ${chalk.bold(items.length)} items.`);
  await executeContracts(items, page, ARCADE_USER_ID!, false);
});
console.log(`${chalk.green.bold("Running")} every 5 minutes`);

console.log(`${chalk.green.bold("Prefetching")} form`);
await page.goto(
  `https://forms.hackclub.com/arcade-order?user_id=${ARCADE_USER_ID}`
);
console.log(`${chalk.green.bold("Prefetched")} form`);
