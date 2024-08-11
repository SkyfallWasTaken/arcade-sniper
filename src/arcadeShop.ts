import chalk from "chalk";
import { parse } from "node-html-parser";
import type { Page } from "playwright";

// https://github.com/SkyfallWasTaken/arcade-monitor/blob/main/src/items.rs
interface RawItem {
  "Full Name": string;
  Description: string | null;
  "Fulfillment Description": string | null;
  "Cost Hours": number;
  Stock: number | null;
  id: string;
}

export interface Item {
  fullName: string;
  description: string | null;
  fulfillmentDescription: string | null;
  price: number;
  stock: number | null;
  id: string;
}

export async function getItems(): Promise<Item[]> {
  const response = await fetch("https://hackclub.com/arcade/shop");
  const html = await response.text();
  const root = parse(html);
  const nextData = root.getElementById("__NEXT_DATA__");
  if (!nextData) {
    throw new Error("__NEXT_DATA__ not found");
  }
  const rawItems: RawItem[] = JSON.parse(nextData.innerText).props.pageProps
    .availableItems;
  return rawItems.map((rawItem) => {
    console.log(`${chalk.bold(rawItem["Full Name"].trim())}: ${rawItem.id}`);
    return {
      fullName: rawItem["Full Name"],
      description: rawItem.Description,
      fulfillmentDescription: rawItem["Fulfillment Description"],
      price: rawItem["Cost Hours"],
      stock: rawItem.Stock,
      id: rawItem.id,
    };
  });
}

export async function getTicketCount(
  id: string,
  page: Page
): Promise<number> {
  await page.goto(`https://hackclub.com/arcade/${id}/shop`);
  const ticketCountTextEl = await page.getByText("Your current balance is").first();
  const ticketCount = Number.parseInt(
    (await ticketCountTextEl.innerText())
      .replace("Your current balance is ", "")
      .replace(" 🎟️", "")
  );
  return ticketCount;
}
