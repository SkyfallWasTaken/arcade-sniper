import fs from "fs/promises";
import path from "path";
import itemMappings from "../itemMappings.json";
import executedContracts from "../contracts.json";
import chalk from "chalk";
import purchaseItem from "./purchaseItem";
import type { Item } from "./arcadeShop";
import type { Page } from "playwright";

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

async function scan(directoryName = "contracts", results: ScanResult[] = []) {
  let files = await fs.readdir(directoryName, { withFileTypes: true });
  for (let f of files) {
    let fullPath = path.join(directoryName, f.name);
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
  return results.filter(
    (result) => !(executedContracts.completed as string[]).includes(result.id)
  );
}

const contracts = await scan();

export default async function (
  items: Item[],
  page: Page,
  userId: string,
  dryRun: boolean = false
) {
  console.log(
    `Found ${chalk.bold(contracts.length)} new contracts to execute.`
  );
  const newlyCompletedContracts: string[] = [];
  contracts.forEach(async (contractInfo) => {
    const contract = contractInfo.contract;
    const itemId = (itemMappings as ItemMappings)[contract.item]; // Safe, as validated above
    const item = items.find((item) => item.id === itemId);
    if (!item) {
      return console.warn(
        `Item with ID "${itemId}" not found. It may have been deleted :(`
      );
    }
    console.log(
      `${chalk.green.bold("Executing")} contract \`${contractInfo.id}\``
    );

    if (!(contract.maxPrice >= item.price)) return fail(contractInfo.id);

    console.log(
      `Contract \`${contractInfo.id}\` ${chalk.green.bold("PASSED")}`
    );
    await purchaseItem(page, itemId, contract.purchase, userId, dryRun);
    newlyCompletedContracts.push(contractInfo.id);
  });
  await fs.writeFile(
    "../contracts.json",
    JSON.stringify([
      ...(executedContracts.completed as string[]),
      ...newlyCompletedContracts,
    ])
  );
}

function fail(contractId: string) {
  console.log(
    `Contract \`${contractId}\` does not meet requirements for execution`
  );
}
