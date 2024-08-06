import { test } from "./fixtures/lxd-test";
import { deleteInstance, randomInstanceName } from "./helpers/instances";

test("search for custom image and create an instance from it", async ({
  page,
}) => {
  test.skip(
    Boolean(!process.env.CI),
    "Skipping test locally for custom image creation",
  );
  const customInstance = randomInstanceName();
  const image = "my-custom-image"; // this is created in pr.yaml and coverage.yaml

  await page.goto("/ui/");
  await page.getByRole("link", { name: "Images", exact: true }).click();
  await page.getByPlaceholder("Search").click();
  await page.getByPlaceholder("Search").fill(image);
  await page.getByRole("button", { name: "Create instance" }).first().click();
  await page.getByLabel("Instance name").fill(customInstance);
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await page.waitForSelector(`text=Created instance ${customInstance}.`);

  await deleteInstance(page, customInstance);
});
