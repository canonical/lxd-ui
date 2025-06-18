import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";

export const randomBucketName = (): string => {
  return `playwright-bucket-${randomNameSuffix()}`;
};

export const createBucket = async (page: Page, bucket: string) => {
  await page.getByRole("button", { name: "Create bucket" }).click();
  await page.getByPlaceholder("Enter name").fill(bucket);
  await page.getByPlaceholder("Enter value").fill("200");
  await page.getByPlaceholder("Enter description").fill("Test description");
};
