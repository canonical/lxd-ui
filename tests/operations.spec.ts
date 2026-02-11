import { test } from "./fixtures/lxd-test";
import {
  createInstance,
  deleteInstance,
  randomInstanceName,
  visitAndStartInstance,
  visitAndStopInstance,
} from "./helpers/instances";
import { validateOperation } from "./helpers/operations";
import { dismissNotification } from "./helpers/notification";

test("instance operations are recognised on the Operations page", async ({
  page,
}) => {
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await dismissNotification(page);
  await validateOperation(page, `Creating instance${instance}`);

  // start instance and wait for the notification instance was started
  await visitAndStartInstance(page, instance);
  await dismissNotification(page);
  await validateOperation(page, `Starting instance${instance}`);

  // stop instance and validate stop operation is in operation list
  await visitAndStopInstance(page, instance);
  await dismissNotification(page);
  await validateOperation(page, `Stopping instance${instance}`);

  // delete instance and validate delete operation is in operation list
  await deleteInstance(page, instance);
  await dismissNotification(page);
  await validateOperation(page, `Deleting instance${instance}`);
});
