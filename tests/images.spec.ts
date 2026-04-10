import { byOSRelease } from "util/images";
import { expect, test } from "./fixtures/lxd-test";
import { deleteImage, visitLocalImages } from "./helpers/images";
import {
  createImageFromInstance,
  createInstance,
  deleteInstance,
  randomImageName,
  randomInstanceName,
} from "./helpers/instances";
import { gotoURL } from "./helpers/navigate";
import type { LxdImage, LxdImageType, RemoteImage } from "types/image";

test("search for custom image and create an instance from it", async ({
  page,
}) => {
  const customInstance = randomInstanceName();
  const instance = randomInstanceName();
  const imageAlias = randomImageName();

  await createInstance(page, instance);
  await createImageFromInstance(page, instance, imageAlias);
  await deleteInstance(page, instance);

  await visitLocalImages(page, "default");
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(imageAlias);
  await page.getByRole("button", { name: "Create instance" }).first().click();
  await page.getByLabel("Instance name").fill(customInstance);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.getByText(`Created instance ${customInstance}.`).waitFor();

  await deleteInstance(page, customInstance);
  await deleteImage(page, imageAlias);
});

test("Export and Import an image", async ({ page }) => {
  // creating an image from an instance, because we can only export unified images
  // and can't test the export with a standard image fetched from the image server
  // we can remove this step once the export of split images is enabled by the backend.
  const instance = randomInstanceName();
  const imageAlias = randomImageName();

  await createInstance(page, instance);
  await createImageFromInstance(page, instance, imageAlias);
  const downloadPromise = page.waitForEvent("download");

  await page.getByRole("button", { name: "Images" }).click();
  await page.getByRole("link", { name: "Local images", exact: true }).click();
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(imageAlias);

  await expect(page.getByText(imageAlias)).toBeVisible();
  await page.getByLabel("export image").click();
  const download = await downloadPromise;
  await page
    .getByText(`Download started. Please check your downloads folder.`)
    .waitFor();
  const IMAGE_FILE = "tests/fixtures/image.tar.gz";
  await download.saveAs(IMAGE_FILE);
  await deleteImage(page, imageAlias);

  //Import an image
  await gotoURL(page, "/ui/");
  await visitLocalImages(page, "default");

  await page.getByRole("button", { name: "Import image" }).click();
  await page.getByLabel("Image backup file").setInputFiles(IMAGE_FILE);
  await page.getByPlaceholder("Enter alias").fill(imageAlias);
  await page
    .getByLabel("Import image from file")
    .getByRole("button", { name: "Import image" })
    .click();
  await expect(page.getByText(imageAlias)).toBeVisible();
  await page.getByText(`Image imported.`).waitFor();

  await deleteImage(page, imageAlias);
  await deleteInstance(page, instance);
});

test.describe("byOSRelease", () => {
  const createRemoteImage = (
    os: string,
    release: string,
    release_title?: string,
    type?: LxdImageType,
    server?: string,
  ): RemoteImage => ({
    aliases: "",
    arch: "amd64",
    os,
    release,
    release_title,
    type: type || "container",
    server: server || "images",
    created_at: Date.now(),
  });

  const createLxdImage = (
    os: string,
    version: string,
    release = "noble",
    type?: LxdImageType,
    isLts = false,
  ): LxdImage => ({
    fingerprint: "abc123",
    public: true,
    architecture: "amd64",
    type: type || "container",
    cached: false,
    uploaded_at: new Date().toISOString(),
    properties: {
      os,
      version,
      release,
      description: isLts ? `${os} ${version} LTS` : `${os} ${version}`,
    },
    size: 1234,
    aliases: [],
  });

  test.describe("RemoteImage sorting", () => {
    test("should sort by OS alphabetically", () => {
      const ubuntu = createRemoteImage("Ubuntu", "22.04");
      const alpine = createRemoteImage("Alpine", "3.18");
      const centos = createRemoteImage("CentOS", "9");

      const sorted = [ubuntu, centos, alpine].sort(byOSRelease);

      expect(sorted.map((img) => img.os)).toEqual([
        "Alpine",
        "CentOS",
        "Ubuntu",
      ]);
    });

    test("should sort by release version (newer first)", () => {
      const ubuntu2204 = createRemoteImage("Ubuntu", "22.04");
      const ubuntu2404 = createRemoteImage("Ubuntu", "24.04");
      const ubuntu2604 = createRemoteImage("Ubuntu", "26.04");

      const sorted = [ubuntu2204, ubuntu2604, ubuntu2404].sort(byOSRelease);

      expect(sorted.map((img) => img.release)).toEqual([
        "26.04",
        "24.04",
        "22.04",
      ]);
    });

    test("should put LTS before regular versions", () => {
      const image = createRemoteImage("Ubuntu", "22.04");
      const imageLTS = createRemoteImage("Ubuntu", "22.04", "22.04 LTS");
      const sorted = [image, imageLTS].sort(byOSRelease);
      expect(sorted[0]).toBe(imageLTS); // "22.04 LTS" comes before "22.04"
    });

    test("should include type and server in sorting", () => {
      const container = createRemoteImage(
        "Ubuntu",
        "22.04",
        undefined,
        "container",
        "images",
      );
      const vm = createRemoteImage(
        "Ubuntu",
        "22.04",
        undefined,
        "virtual-machine",
        "images",
      );

      const sorted = [container, vm].sort(byOSRelease);

      expect(sorted[0]).toBe(container); // "container" comes before "virtual-machine"
    });
  });

  test.describe("LxdImage sorting", () => {
    test("should sort by OS alphabetically", () => {
      const ubuntu = createLxdImage("ubuntu", "22.04");
      const alpine = createLxdImage("alpine", "3.18");

      const sorted = [ubuntu, alpine].sort(byOSRelease);

      expect(sorted.map((img) => img.properties?.os)).toEqual([
        "alpine",
        "ubuntu",
      ]);
    });

    test("should sort by version (newer first)", () => {
      const v2204 = createLxdImage("ubuntu", "22.04");
      const v2404 = createLxdImage("ubuntu", "24.04");
      const v2604 = createLxdImage("ubuntu", "26.04");

      const sorted = [v2204, v2604, v2404].sort(byOSRelease);

      expect(sorted.map((img) => img.properties?.version)).toEqual([
        "26.04",
        "24.04",
        "22.04",
      ]);
    });

    test("should handle LTS versions correctly", () => {
      const regular = createLxdImage("ubuntu", "25.10");
      const lts = createLxdImage(
        "ubuntu",
        "24.04",
        undefined,
        "container",
        true,
      );

      const sorted = [lts, regular].sort(byOSRelease);

      // Regular 25.10 should come before 24.04 LTS (newer first)
      expect(sorted[0]).toBe(regular);
    });
  });

  test.describe("Mixed RemoteImage and LxdImage sorting", () => {
    test("should sort mixed image types consistently", () => {
      const remoteUbuntu = createRemoteImage("Ubuntu", "24.04");
      const localUbuntu = createLxdImage("ubuntu", "22.04");
      const remoteAlpine = createRemoteImage("Alpine", "3.18");

      const sorted = [localUbuntu, remoteAlpine, remoteUbuntu].sort(
        byOSRelease,
      );

      // Verify sorting is consistent by checking OS order and version order
      const sortedOSes = sorted.map((img) =>
        ("os" in img ? img.os : img.properties?.os || "").toLowerCase(),
      );

      // Should be sorted alphabetically by OS: alpine, ubuntu, ubuntu
      expect(sortedOSes[0]).toBe("alpine");
      expect(sortedOSes[1]).toBe("ubuntu");
      expect(sortedOSes[2]).toBe("ubuntu");

      // Within Ubuntu images, newer version should come first
      const ubuntuImages = sorted.filter(
        (img) =>
          ("os" in img ? img.os : img.properties?.os || "").toLowerCase() ===
          "ubuntu",
      );
      expect(ubuntuImages[0]).toBe(remoteUbuntu); // 24.04
      expect(ubuntuImages[1]).toBe(localUbuntu); // 22.04
    });
  });

  test.describe("Edge cases", () => {
    test("should handle empty/missing fields gracefully", () => {
      const emptyRemote = createRemoteImage("", "");
      const emptyLocal = createLxdImage("", "");

      expect(() => [emptyRemote, emptyLocal].sort(byOSRelease)).not.toThrow();
    });

    test("should handle undefined properties", () => {
      const imageWithoutProps: LxdImage = {
        fingerprint: "abc123",
        architecture: "amd64",
        type: "container",
        cached: false,
        uploaded_at: new Date().toISOString(),
        public: true,
        size: 1234,
        aliases: [],
      };

      expect(() =>
        [imageWithoutProps, createRemoteImage("Ubuntu", "22.04")].sort(
          byOSRelease,
        ),
      ).not.toThrow();
    });

    test("should sort identical images consistently", () => {
      const img1 = createRemoteImage("Ubuntu", "22.04");
      const img2 = createRemoteImage("Ubuntu", "22.04");

      const result1 = byOSRelease(img1, img2);
      const result2 = byOSRelease(img2, img1);

      expect(result1).toBe(result2);
    });
  });
});
