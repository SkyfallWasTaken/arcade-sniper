import type { Page } from "playwright";
import { startNewSubmission, filloutDropdown, ackCustomsFees } from "./actions";
import userData from "../userData.json";
import chalk from "chalk";

const fieldMappings: { [key: string]: string } = {
  "First Name": userData.firstName,
  "Last Name": userData.lastName,

  "Your address (Address)": userData.addressLine1,
  "Your address ([object Object])": userData.addressLine2,
  "Your address (City)": userData.city,
  "Your address (State / Province)": userData.stateOrProvince,
  "Your address (ZIP / Postal code)": userData.postalCode,
  "Your phone number": userData.phoneNumber,
};

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
  for (const key in fieldMappings) {
    const value = fieldMappings[key];

    try {
      // For some reason, Playwright is finding two fields for the address fields.
      // This code is a hack to fill the first field.
      await page.getByLabel(key).first().fill(value);
    } catch (e) {
      console.error(chalk.bold.red(`Field ${key} not found`));
      console.error(e);
    }
  }
  await filloutDropdown("Your address (Country)", userData.country, page);

  const nextButton = page.getByText("Next →");
  await nextButton.click();

  await ackCustomsFees(page);

  if (dryRun) {
    console.log(chalk.yellow.bold("Dry run enabled, not submitting"));
  }

  const finishButton = page.getByText("Next →");
  await finishButton.click();
  console.log(chalk.bold.green("Purchase complete!"));
}
