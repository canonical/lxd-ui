import { expect, test } from "./fixtures/lxd-test";
import { getLxcCmd } from "./helpers/auth";
import {
  createInstance,
  deleteInstance,
  getInstanceCount,
  randomInstanceName,
  visitAndStartInstance,
  visitAndStopInstance,
} from "./helpers/instances";
import { validateOperation, visitOperations } from "./helpers/operations";
import { runCommand } from "./helpers/shell";

test("instance operations are recognised on the Operations page", async ({
  page,
}) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await validateOperation(page, `Creating instance${instance}`);

  // start instance and wait for the notification instance was started
  await visitAndStartInstance(page, instance);
  await validateOperation(page, `Starting instance${instance}`);

  // stop instance and validate stop operation is in operation list
  await visitAndStopInstance(page, instance);
  await validateOperation(page, `Stopping instance${instance}`);

  // delete instance and validate delete operation is in operation list
  await deleteInstance(page, instance);
  await validateOperation(page, `Deleting instance`);
});

test("bulk stop operation renders and expands child operations", async ({
  page,
}) => {
  const firstInstance = randomInstanceName();
  const secondInstance = randomInstanceName();

  await createInstance(page, firstInstance);
  await createInstance(page, secondInstance);

  await visitAndStartInstance(page, firstInstance);
  await visitAndStartInstance(page, secondInstance);

  const lxc = getLxcCmd();
  const instanceCount = getInstanceCount("default");
  runCommand(`${lxc} stop --all --project default`);

  await visitOperations(page);

  const childOperationsChip = page.getByRole("button", {
    name: `${instanceCount} child operations`,
  });
  await expect(childOperationsChip).toBeVisible();
  await childOperationsChip.click();

  const childRows = page.locator(
    "#operation-table tbody tr.child-operation-row",
  );
  await expect(childRows).toHaveCount(instanceCount);

  const firstChildRow = childRows.filter({ hasText: firstInstance });
  await expect(firstChildRow).toBeVisible();
  await expect(firstChildRow).toContainText("Stopping instance");
  await expect(firstChildRow).toContainText("Project: default");
  await expect(firstChildRow).toContainText("Success");

  const secondChildRow = childRows.filter({ hasText: secondInstance });
  await expect(secondChildRow).toBeVisible();
  await expect(secondChildRow).toContainText("Stopping instance");
  await expect(secondChildRow).toContainText("Project: default");
  await expect(secondChildRow).toContainText("Success");
  await deleteInstance(page, firstInstance);
  await deleteInstance(page, secondInstance);
});
