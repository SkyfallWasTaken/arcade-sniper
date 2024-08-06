import "dotenv/config";
import { chromium } from "playwright";
import executeContracts from "./contract";
import { getItems } from "./arcadeShop";
import chalk from "chalk";
import Cron from "croner";

const ARCADE_USER_ID = process.env.ARCADE_USER_ID;
const FILLOUT_SESSION_TOKEN = process.env.FILLOUT_SESSION_TOKEN;

console.log("Launching browser...");
const browser = await chromium.launch({
  headless: false,
});
const context = await browser.newContext();
context.addCookies([
  {
    name: "fillout_session_token__81_email",
    path: "/",
    value: FILLOUT_SESSION_TOKEN!,
    domain: "forms.hackclub.com",
  },
]);
console.log("Loading page...");
const page = await context.newPage();

Cron("*/5 * * * *", async () => {
  const items = await getItems();
  console.log(`Fetched ${chalk.bold(items.length)} items.`);
  await executeContracts(items, page, ARCADE_USER_ID!, true);
});
