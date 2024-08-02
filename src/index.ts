import "dotenv/config";
import { chromium } from "playwright";
import purchaseItem from "./purchaseItem";

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

await purchaseItem(page, "recJN0RO9obEGqP6e", 1, ARCADE_USER_ID!, true);
