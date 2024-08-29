import fs from "node:fs/promises";
import path from "node:path";
import chalk from "chalk";
import type { Page } from "playwright";
import itemMappings from "../itemMappings.json";
import type { Item } from "./arcadeShop";
import purchaseItem from "./purchaseItem";

interface Contract {
  item: string;
  purchase: number;
  maxPrice: number;
}

interface ScanResult {
  id: string;
  contract: Contract;
}

type ItemMappings = { [key: string]: string };

async function executedContracts(): any {
  return JSON.parse(await fs.readFile("../contracts.json"))
}

async function scan(directoryName = "contracts", results: ScanResult[] = []) {
  const files = await fs.readdir(directoryName, { withFileTypes: true });
  for (const f of files) {
    const fullPath = path.join(directoryName, f.name);
    if (f.isDirectory()) {
      await scan(fullPath, results);
    } else {
      const contract = JSON.parse((await fs.readFile(fullPath)).toString());
      if (!(itemMappings as ItemMappings)[contract.item]) {
        throw new Error(`Mapping "${contract.item}" not found`);
      }
      results.push({
        id: path.parse(fullPath).name,
        contract,
      });
    }
  }
  let executed = await executedContracts();
  return results.filter(
    (result) => !(executed.completed as string[]).includes(result.id)
  );
}

const contracts = await scan();

export default async function (
  items: Item[],
  page: Page,
  userId: string,
  ticketCount: number,
  dryRun = false
) {
  console.log(`Found ${chalk.bold(contracts.length)} new contracts to execute.`);
  const newlyCompletedContracts: string[] = [];
  for (const contractInfo of contracts) {
    const contract = contractInfo.contract;
    const itemId = (itemMappings as ItemMappings)[contract.item]; // Safe, as validated above
    const item = items.find((item) => item.id === itemId);
    if (!item) {
      console.warn(`Item with ID "${itemId}" not found. It may have been deleted :(`);
      continue;
    }
    console.log(`${chalk.green.bold("Executing")} contract \`${contractInfo.id}\``);

    if (!(contract.maxPrice >= item.price)) {
      fail(contractInfo.id);
      continue;
    }
    if (ticketCount < contract.purchase * item.price) {
      fail(contractInfo.id);
      continue;
    }
    if (!item.stock || item.stock < contract.purchase) {
      fail(contractInfo.id);
      continue;
    }

    console.log(`Contract \`${contractInfo.id}\` ${chalk.green.bold("PASSED")}`);
    await purchaseItem(page, itemId, contract.purchase, userId, dryRun);
    newlyCompletedContracts.push(contractInfo.id);
  }

  await fs.writeFile(
    "contracts.json",
    JSON.stringify(
      {
        completed: [
          ...((await executedContracts()).completed as string[]),
          ...newlyCompletedContracts,
        ],
      },
      null,
      2
    )
  );
}

function fail(contractId: string) {
  console.log(`Contract \`${contractId}\` does not meet requirements for execution`);
}
