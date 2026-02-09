import { expect, test } from "./fixtures/lxd-test";
import { deleteImage, visitImages } from "./helpers/images";
import {
  createImageFromInstance,
  createInstance,
  deleteInstance,
  randomImageName,
  randomInstanceName,
} from "./helpers/instances";
import { gotoURL } from "./helpers/navigate";

test("search for custom image and create an instance from it", async ({
  page,
}) => {
  const customInstance = randomInstanceName();
  const instance = randomInstanceName();
  const imageAlias = randomImageName();

  await createInstance(page, instance);
  await createImageFromInstance(page, instance, imageAlias);
  await deleteInstance(page, instance);

  await visitImages(page, "default");
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(imageAlias);
  await page.getByRole("button", { name: "Create instance" }).first().click();
  await page.getByLabel("Instance name").fill(customInstance);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Created instance ${customInstance}.`);

  await deleteInstance(page, customInstance);
  await deleteImage(page, imageAlias);
});

test("Export and Upload an image", async ({ page }) => {
  // creating an image from an instance, because we can only export unified images
  // and can't test the export with a standard image fetched from the image server
  // we can remove this step once the export of split images is enabled by the backend.
  const instance = randomInstanceName();
  const imageAlias = randomImageName();

  await createInstance(page, instance);
  await createImageFromInstance(page, instance, imageAlias);
  const downloadPromise = page.waitForEvent("download");

  await page.getByRole("link", { name: "Images", exact: true }).click();
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(imageAlias);

  await expect(page.getByText(imageAlias)).toBeVisible();
  await page.getByLabel("export image").click();
  const download = await downloadPromise;
  await page.waitForSelector(
    `text=download started. Please check your downloads folder.`,
  );
  const IMAGE_FILE = "tests/fixtures/image.tar.gz";
  await download.saveAs(IMAGE_FILE);
  await deleteImage(page, imageAlias);

  //Upload an image
  await gotoURL(page, "/ui/");
  await page.getByRole("link", { name: "Images", exact: true }).click();

  await page.getByRole("button", { name: "Upload image" }).click();
  await page.getByLabel("Image backup file").setInputFiles(IMAGE_FILE);
  await page.getByPlaceholder("Enter alias").fill(imageAlias);
  await page
    .getByLabel("Import image from file")
    .getByRole("button", { name: "Upload image" })
    .click();
  await expect(page.getByText(imageAlias)).toBeVisible();
  await page.waitForSelector(`text=Image uploaded.`);

  await deleteImage(page, imageAlias);
  await deleteInstance(page, instance);
});
