import type { Page } from "playwright";
import { startNewSubmission } from "./actions";
import userData from "../userData.json";

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
  userId: string
) {
  await page.goto(
    `https://forms.hackclub.com/arcade-order?user_id=${userId}&item_id=${itemId}&quantity=${quantity}&image=`
  );
  startNewSubmission(page);

  for (const key in fieldMappings) {
    const value = fieldMappings[key];
    console.log(`${key}: ${value}`);

    try {
      // For some reason, Playwright is finding two fields for the address fields.
      // This code is a hack to fill the first field.
      await page.getByLabel(key).first().fill(value);
    } catch (e) {
      console.error(`Field ${key} not found`);
      console.error(e);
    }
  }
}
