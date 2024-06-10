import { test } from "./fixtures/lxd-test";
import {
  createInstance,
  deleteInstance,
  editInstance,
  randomInstanceName,
} from "./helpers/instances";
import {
  createProject,
  deleteProject,
  randomProjectName,
} from "./helpers/projects";
import { validateLink } from "./helpers/doc-links";
import { openServerSetting, visitServerSettings } from "./helpers/server";
import { activateOverride } from "./helpers/configuration";

test("Ensure the documentation link text and link targets are present: Server Settings > Override", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Generated documentation only started shipping with newer versions of LXD",
  );
  await visitServerSettings(page);

  await openServerSetting(page, "cluster.https_address");
  await validateLink(
    page,
    "Separate REST API and clustering networks",
    "/documentation/howto/cluster_config_networks/#cluster-https-address",
  );

  await openServerSetting(page, "core.bgp_address");
  await validateLink(
    page,
    "How to configure LXD as a BGP server",
    "/documentation/howto/network_bgp/#network-bgp",
  );

  await openServerSetting(page, "core.dns_address");
  await validateLink(
    page,
    "Enable the built-in DNS server",
    "/documentation/howto/network_zones/#network-dns-server",
  );

  await openServerSetting(page, "core.https_address");
  await validateLink(
    page,
    "How to expose LXD to the network",
    "/documentation/howto/server_expose/#server-expose",
  );

  await openServerSetting(page, "core.metrics_address");
  await validateLink(page, "How to monitor metrics", "/documentation/metrics/");

  await openServerSetting(page, "core.storage_buckets_address");
  await validateLink(
    page,
    "How to manage storage buckets and keys",
    "/documentation/howto/storage_buckets/#howto-storage-buckets",
  );

  await openServerSetting(page, "instances.placement.scriptlet");
  await validateLink(
    page,
    "Instance placement scriptlet",
    "/documentation/explanation/clustering/#clustering-instance-placement-scriptlet",
  );
});

test("Ensure the documentation link text and link targets are present: Instance Detail > Configuration", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Unavailable API Extensions: metadata_configuration",
  );
  const instance = randomInstanceName();
  await createInstance(page, instance);
  await editInstance(page, instance);

  await page.getByText("Security policies").click();

  await activateOverride(page, "Privileged (Containers only)");
  await validateLink(
    page,
    "Container security",
    "/documentation/explanation/security/#container-security",
  );
  await activateOverride(
    page,
    "Allow /dev/lxd in the instance (Containers only)",
  );
  await validateLink(
    page,
    "Communication between instance and host",
    "/documentation/dev-lxd/",
  );

  await page.getByLabel("Configuration").getByText("Snapshots").click();

  await activateOverride(page, "Snapshot name pattern");
  await validateLink(
    page,
    "Automatic snapshot names",
    "/documentation/reference/instance_options/#instance-options-snapshots-names",
  );

  await page.getByText("YAML Configuration").click();

  await validateLink(
    page,
    "Learn more about instances",
    "/documentation/instances",
  );

  // Set Down
  await deleteInstance(page, instance);
});

test("Ensure the documentation link text and link targets are present: Project > Configuration", async ({
  page,
  lxdVersion,
}) => {
  test.skip(
    lxdVersion === "5.0-edge",
    "Unavailable API Extensions: metadata_configuration",
  );
  const project = randomProjectName();
  await createProject(page, project);
  await page.getByRole("link", { name: "Configuration" }).click();
  await page.getByRole("button", { name: "Edit configuration" }).click();
  await page.getByText("Allow custom restrictions on a project level").click();

  await page.getByText("Resource limits").click();

  await activateOverride(page, "Max sum of CPU");
  await validateLink(
    page,
    "limits.cpu",
    "/documentation/reference/projects/#project-limits:limits.cpu",
  );
  await activateOverride(page, "Max sum of memory limits");
  await validateLink(
    page,
    "limits.memory",
    "/documentation/reference/projects/#project-limits:limits.memory",
  );
  await activateOverride(page, "Max sum of processes");
  await validateLink(
    page,
    "limits.processes",
    "/documentation/reference/projects/#project-limits:limits.processes",
  );

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Instances")
    .click();

  await activateOverride(page, "Low level VM operations");
  await validateLink(
    page,
    "raw.qemu",
    "/documentation/reference/instance_options/#instance-raw:raw.qemu",
  );

  await activateOverride(page, "Low level container operations");
  await validateLink(
    page,
    "raw.lxc",
    "/documentation/reference/instance_options/#instance-raw:raw.lxc",
  );
  await validateLink(
    page,
    "raw.idmap",
    "/documentation/reference/instance_options/#instance-raw:raw.idmap",
  );

  await activateOverride(page, "Container nesting");
  await validateLink(
    page,
    "security.nesting",
    "/documentation/reference/instance_options/#instance-security:security.nesting",
  );

  await activateOverride(page, "Container privilege");
  await validateLink(
    page,
    "security.privileged",
    "/documentation/reference/instance_options/#instance-security:security.privileged",
  );
  await validateLink(
    page,
    "security.idmap.isolated",
    "/documentation/reference/instance_options/#instance-security:security.idmap.isolated",
  );

  await page.getByText("Device usage").click();

  await activateOverride(page, "Disk devices (except the root");
  await validateLink(
    page,
    "restricted.devices.disk.paths",
    "/documentation/reference/projects/#project-restricted:restricted.devices.disk.paths",
  );

  await activateOverride(page, "Disk devices path");
  await validateLink(
    page,
    "restricted.devices.disk",
    "/documentation/reference/projects/#project-restricted:restricted.devices.disk",
  );

  await page
    .getByRole("navigation", { name: "Project form navigation" })
    .getByText("Networks")
    .click();

  await activateOverride(page, "Available networks");
  await validateLink(
    page,
    "restricted.devices.nic",
    "/documentation/reference/projects/#project-restricted:restricted.devices.nic",
  );

  //Set Down
  await deleteProject(page, project);
});
