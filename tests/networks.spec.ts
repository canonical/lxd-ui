import { test } from "@playwright/test";
import {
  createNetwork,
  deleteNetwork,
  editNetwork,
  randomNetworkName,
  saveNetwork,
  visitNetwork,
} from "./helpers/network";

test("network create and remove", async ({ page }) => {
  const network = randomNetworkName();
  await createNetwork(page, network);
  await deleteNetwork(page, network);
});

test("network edit basic details", async ({ page }) => {
  const network = randomNetworkName();
  await createNetwork(page, network);

  await editNetwork(page, network);
  await page.getByPlaceholder("Enter description").fill("A-new-description");
  await saveNetwork(page);

  await visitNetwork(page, network);
  await page.getByRole("cell", { name: "A-new-description" }).click();

  await deleteNetwork(page, network);
});
