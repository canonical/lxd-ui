import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { expect } from "../fixtures/lxd-test";
import { gotoURL } from "./navigate";

export const randomBucketName = (): string => {
  return `playwright-bucket-${randomNameSuffix()}`;
};

export const createBucket = async (page: Page, bucket: string) => {
  await page.getByRole("link", { name: "Buckets", exact: true }).click();
  await page.getByRole("button", { name: "Create bucket" }).click();
  await page.getByPlaceholder("Enter name").fill(bucket);
  await page.getByPlaceholder("Enter value").fill("200");
  await page.getByPlaceholder("Enter description").fill("Test description");
  await page
    .getByLabel("Side panel")
    .getByRole("button", { name: "Create bucket" })
    .click();
  await page.waitForSelector(`text=Storage bucket ${bucket} created.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deleteBucket = async (page: Page, bucket: string) => {
  await visitBucket(page, bucket);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(`text=Storage bucket ${bucket} deleted.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const visitBucket = async (page: Page, bucket: string) => {
  await gotoURL(page, `/ui/`);
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Buckets" }).click();
  await expect(page.getByText("Create bucket")).toBeVisible();
  await page.getByPlaceholder("Search and filter").fill(bucket);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");
  await page.getByRole("link", { name: bucket }).first().click();
  await expect(page.getByText("Create key", { exact: true })).toBeVisible();
};

export const createBucketKey = async (
  page: Page,
  bucket: string,
  bucketkey: string,
) => {
  await page.getByRole("button", { name: "Create key" }).click();
  await page.getByPlaceholder("Enter name").fill(bucketkey);
  await page.getByPlaceholder("Enter description").fill("Test description");
  await page
    .getByLabel("Side panel")
    .getByRole("button", { name: "Create key" })
    .click();
  await page.waitForSelector(
    `text=Key ${bucketkey} created for storage bucket ${bucket}`,
  );
  await page.getByRole("button", { name: "Close notification" }).click();
};

export const deleteBucketKey = async (
  page: Page,
  bucket: string,
  bucketkey: string,
) => {
  await page.getByRole("row").filter({ hasText: bucketkey }).hover();
  await page.getByRole("button", { name: "Delete key", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await page.waitForSelector(
    `text=Key ${bucketkey} deleted for storage bucket ${bucket}`,
  );
};
