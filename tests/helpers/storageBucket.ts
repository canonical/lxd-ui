import type { Page } from "@playwright/test";
import { randomNameSuffix } from "./name";
import { gotoURL } from "./navigate";

export const randomBucketName = (): string => {
  return `playwright-bucket-${randomNameSuffix()}`;
};

export const createBucket = async (page: Page, bucket: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Buckets" }).click();
  await page.getByRole("button", { name: "Create bucket" }).click();
  await page.getByPlaceholder("Enter name").fill(bucket);

  //   Select first pool in dropdown? Is this testable? Need Cephpool...

  await page
    .getByRole("button", { name: "Create bucket", exact: true })
    .click();
  await page.waitForSelector(`text=Bucket ${bucket} created.`);
  await page.getByRole("button", { name: "Close notification" }).click();
};

// export const openBucketPanel = async (page: Page, bucket: string) => {
//   INCLUDE
// };

export const editBucket = async (page: Page, bucket: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Buckets" }).click();
  //   await openBucketPanel(page, bucket);
  await page.getByPlaceholder("Enter value").fill("2");
  await saveBucket(page, bucket);
};

export const saveBucket = async (page: Page, bucket: string) => {
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.waitForSelector(`text=Storage bucket ${bucket} updated.`);
};

export const deleteBucket = async (page: Page, bucket: string) => {
  await gotoURL(page, "/ui/");
  await page.getByRole("button", { name: "Storage" }).click();
  await page.getByRole("link", { name: "Buckets" }).click();

  //Delete via bucket row

  await page.waitForSelector(`text=Storage bucket ${bucket} deleted.`);
};
