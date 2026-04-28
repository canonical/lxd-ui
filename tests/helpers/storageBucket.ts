import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { expect } from "../fixtures/lxd-test";
import { gotoURL } from "./navigate";
import { dismissNotification } from "./notification";

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
  await dismissNotification(page, `Storage bucket ${bucket} created.`);
};

export const deleteBucket = async (page: Page, bucket: string) => {
  await visitBucket(page, bucket);
  await page.getByRole("button", { name: "Delete", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await dismissNotification(page, `Storage bucket ${bucket} deleted.`);
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
  bucketKey: string,
) => {
  await page.getByRole("button", { name: "Create key" }).click();
  await page.getByPlaceholder("Enter name").fill(bucketKey);
  await page.getByPlaceholder("Enter description").fill("Test description");
  await page
    .getByLabel("Side panel")
    .getByRole("button", { name: "Create key" })
    .click();
  await dismissNotification(
    page,
    `Key ${bucketKey} created for storage bucket ${bucket}.`,
  );
};

export const deleteBucketKey = async (
  page: Page,
  bucket: string,
  bucketKey: string,
) => {
  const row = page.getByRole("row").filter({ hasText: bucketKey });
  await row.getByRole("button", { name: "Delete key", exact: true }).click();
  await page
    .getByRole("dialog", { name: "Confirm delete" })
    .getByRole("button", { name: "Delete" })
    .click();
  await dismissNotification(
    page,
    `Key ${bucketKey} deleted for storage bucket ${bucket}.`,
  );
};
