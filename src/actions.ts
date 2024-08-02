import type { Page } from "playwright";

// Checks to see if we have a submission pending.
function isPreviousSubmissionPending(page: Page): boolean {
  const result =
    page.getByText("You have a submission in progress") != undefined;
  console.debug(`isPreviousSubmissionPending: ${result}`);
  return result;
}

// Clicks "New submission" button to restart the submission
export function startNewSubmission(page: Page) {
  if (isPreviousSubmissionPending(page)) {
    const newSubmissionButton = page.getByText("New submission");
    // The button you can actually click is 4 elements parent to the text itself
    newSubmissionButton.first().locator("../../../..").click();
  }
}

export async function ackCustomsFees(page: Page) {
  const feeHeading = page.getByText("Possible Fee Notice");
  if (feeHeading) {
    const checkboxes = page.getByLabel("Checkbox: unchecked");
    for (const checkbox of await checkboxes.all()) {
      await checkbox.click();
    }
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
