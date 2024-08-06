import type { Page } from "playwright";
import { startNewSubmission, filloutDropdown, ackCustomsFees } from "./actions";
import userData from "../userData.json";
import chalk from "chalk";
import mappings from "./fieldMappings";

interface FieldMappings {
  [key: string]: string;
}

interface Mappings {
  [key: string]: FieldMappings;
}

const fieldMappings: FieldMappings = {
  "First Name": userData.firstName,
  "Last Name": userData.lastName,
  Email: userData.email,

  "Your address (Address)": userData.addressLine1,
  "Your address ([object Object])": userData.addressLine2,
  "Your address (City)": userData.city,
  "Your address (State / Province)": userData.stateOrProvince,
  "Your address (ZIP / Postal code)": userData.postalCode,
  "Your phone number": userData.phoneNumber,
};

const SCREENSHOT_DIR = "order_logs";

export default async function (
  page: Page,
  itemId: string,
  quantity: number,
  userId: string,
  dryRun: boolean = false
) {
  await page.goto(
    `https://forms.hackclub.com/arcade-order?user_id=${userId}&item_id=${itemId}&quantity=${quantity}&image=`,
    { waitUntil: "networkidle" }
  );

  await startNewSubmission(page);

  // Fill in the text fields
  const finalFieldMappings = {
    ...fieldMappings,
    ...(mappings as Mappings)[itemId],
  };
  for (const key in finalFieldMappings) {
    const value = finalFieldMappings[key];

    try {
      // For some reason, Playwright is finding two fields for the address fields.
      // This code is a hack to fill the first field.
      await page.getByLabel(key).first().fill(value, {
        timeout: 250,
      });
    } catch (e) {
      console.error(chalk.bold.red(`Field ${key} not found`));
    }
  }
  await filloutDropdown("Your address (Country)", userData.country, page);

  // Go to the customs screen
  let nextButton = page.getByText("Next");
  await nextButton.click();

  await ackCustomsFees(page);

  // Go to the review screen
  nextButton = page.getByText("Next");
  await nextButton.click();

  // Generate a screenshot of order details
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const screenshotPath = `${SCREENSHOT_DIR}/${timestamp}.png`;
  await page.waitForSelector('text="Please review your order"');
  await page.screenshot({
    path: screenshotPath,
    fullPage: true,
  });

  if (dryRun) {
    console.log(chalk.yellow.bold("Dry run enabled, not submitting"));
    return;
  }

  // Submit the order. Wahoo!
  const finishButton = page.getByText("Place Order");
  await finishButton.click();
  await page.waitForSelector('text="Thank you for submitting your order"');
  console.log(chalk.bold.green("Purchase complete!"));
}
