import type { Page } from "playwright";

// Checks to see if we have a submission pending.
function isPreviousSubmissionPending(page: Page): boolean {
  const result =
    page.getByText("You have a submission in progress") != undefined;
  console.debug(`isPreviousSubmissionPending: ${result}`);
  return result;
}

// Clicks "New submission" button to restart the submission
export async function startNewSubmission(page: Page) {
  if (isPreviousSubmissionPending(page)) {
    const newSubmissionButton = page.getByText("New submission");
    // The button you can actually click is 4 elements parent to the text itself
    await newSubmissionButton.first().locator("../../../..").click();
  }
}

export async function ackCustomsFees(page: Page) {
  const feeHeading = page.getByText("Possible Fee Notice");
  if (feeHeading) {
    console.log("This item has customs fees.");
    const buttons = await page.locator("button").all();
    console.log
    await buttons[2].click();
    await buttons[3].click();
  }
}

// Fills out a dropdown.
export async function filloutDropdown(
  label: string,
  value: string,
  page: Page
) {
  const dropdownInput = page.getByLabel(label);
  await dropdownInput.fill(value);
  await page.keyboard.press("Enter");
}
