import chalk from "chalk";
import type { Page } from "playwright";

// Checks to see if we have a submission pending.
async function isPreviousSubmissionPending(page: Page): Promise<boolean> {
  await page.waitForTimeout(5000); // TODO: flaky and bad
  const result =
    (await page.getByText("You have a submission in progress").count()) !== 0;
  console.debug(`isPreviousSubmissionPending: ${result}`);
  return result;
}

// Clicks "New submission" button to restart the submission
export async function startNewSubmission(page: Page) {
  if (await isPreviousSubmissionPending(page)) {
    const newSubmissionButton = page.getByText("New submission");
    // The button you can actually click is 4 elements parent to the text itself
    await newSubmissionButton.first().locator("../../../..").click();
  }
}

export async function ackCustomsFees(page: Page) {
  const feeHeading = page.getByText("Possible Fee Notice");
  if (feeHeading) {
    console.warn(chalk.yellow("This item has customs fees."));

    // Wait for the specific text to be visible
    await page.waitForSelector(
      'text="Please acknowledge the following before placing your order"'
    );

    const buttons = await page.locator('button[data-cy="checkbox-component"]').all();
    for (const button of buttons) {
      try {
        await button.click({ force: true });
      } catch {}
    }
  }
}

// Fills out a dropdown.
export async function filloutDropdown(label: string, value: string, page: Page) {
  const dropdownInput = page.getByLabel(label);
  if ((await dropdownInput.count()) === 0) {
    return;
  }
  await dropdownInput.fill(value, {
    force: true,
  });
  await page.keyboard.press("Enter");
}
