import { expect, test } from "./fixtures/lxd-test";
import { createPool, deletePool } from "./helpers/storagePool";
import {
  createBucket,
  createBucketKey,
  deleteBucket,
  deleteBucketKey,
  randomBucketName,
  skipIfCephNotSupported,
  visitBucket,
} from "./helpers/storageBucket";
import { cephObject, storageDriverLabels } from "util/storageOptions";
import { dismissNotification } from "./helpers/notification";
import { skipIfNotClustered } from "./helpers/cluster";

test("storage bucket create, edit, delete", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfCephNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const bucket = randomBucketName();
  const pool = "CephObjectPool"; //Pool named for explicit selection & deletion

  await createPool(page, pool, storageDriverLabels[cephObject]);
  await createBucket(page, bucket);

  const row = page.getByRole("row").filter({ hasText: bucket });
  await row.hover();
  await row.getByRole("button", { name: "Edit bucket" }).click();
  await page.getByRole("spinbutton", { name: "Size" }).fill("100");
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await page.getByText(`Storage bucket ${bucket} updated.`).waitFor();

  await page.getByPlaceholder("Search and filter").fill(bucket);
  await page.getByPlaceholder("Search and filter").press("Enter");
  await page.getByPlaceholder("Add filter").press("Escape");
  await page.waitForTimeout(200);
  await expect(page.getByText("100GiB")).toBeVisible();

  await deleteBucket(page, bucket);
  await deletePool(page, pool);
});

test("storage bucket keys create, edit, delete", async ({
  page,
  lxdVersion,
}, testInfo) => {
  skipIfCephNotSupported(lxdVersion);
  skipIfNotClustered(testInfo.project.name);

  const bucket = randomBucketName();
  const bucketKey = `${bucket}-key`;
  const pool = "CephObjectPool"; //Pool named for explicit selection & deletion

  await createPool(page, pool, storageDriverLabels[cephObject]);
  await createBucket(page, bucket);
  await visitBucket(page, bucket);
  await createBucketKey(page, bucket, bucketKey);

  await page.getByRole("row").filter({ hasText: bucketKey }).hover();
  await page.getByRole("button", { name: "Edit bucket key" }).nth(1).click();
  await page.getByPlaceholder("Enter description").fill("Test description 2");
  await page.getByRole("button", { name: "Save 1 change" }).click();
  await dismissNotification(
    page,
    `Key ${bucketKey} updated for storage bucket ${bucket}.`,
  );

  await deleteBucketKey(page, bucket, bucketKey);
  await deleteBucket(page, bucket);
  await deletePool(page, pool);
});
