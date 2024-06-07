import { test } from "./fixtures/lxd-test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
  visitAndStartInstance,
  visitAndStopInstance,
} from "./helpers/instances";
import { assertTextVisible } from "./helpers/permissions";
import {
  checkNotificationExists,
  dismissNotification,
} from "./helpers/notification";
import { validateOperation } from "./helpers/operations";

test("instance operations are recognised on the Operations page", async ({
  page,
}) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);

  // validate create operation is in operation list
  await page.goto("/ui/operations");
  await validateOperation(page, "Creating Instance", instance);

  // start instance and wait for the notification instance was started
  await visitAndStartInstance(page, instance);
  await checkNotificationExists(page);
  await assertTextVisible(page, "Instance " + instance + " started");

  // click on the “x operations” link in the status bar
  await dismissNotification(page);

  // validate the operation to start the instance is in the operation list
  await page.goto("/ui/operations");
  await validateOperation(page, "Starting Instance", instance);

  // stop instance and validate stop operation is in operation list
  await visitAndStopInstance(page, instance);
  await page.goto("/ui/operations");
  await validateOperation(page, "Stopping Instance", instance);

  // delete instance and validate delete operation is in operation list
  await deleteInstance(page, instance);
  await page.goto("/ui/operations");
  await validateOperation(page, "Deleting Instance", instance);
});
