import { formDeviceToPayload, parseDevices } from "./formDevices";
import { objectToYaml, yamlToObject } from "./yaml";
import type { LxdInstance } from "types/instance";

const deviceYaml =
  "devices:\n" +
  "  root:\n" +
  "    path: /\n" +
  "    pool: big-pool\n" +
  "    size: 10GiB\n" +
  "    type: disk\n" +
  "    size.state: 3GiB\n" +
  "    boot.priority: 7\n" +
  "  eth0:\n" +
  "    network: lxcbr\n" +
  "    type: nic\n" +
  "  eth1:\n" +
  "    ipv4.address: 10.76.171.21\n" +
  "    name: eth0\n" +
  "    network: mybr\n" +
  "    type: nic\n" +
  "  grafananat:\n" +
  "    connect: tcp:10.76.171.21:3000\n" +
  "    listen: tcp:192.168.0.90:3000\n" +
  "    nat: 'true'\n" +
  "    type: proxy\n" +
  "  prometheusnat:\n" +
  "    connect: tcp:10.76.171.21:9090\n" +
  "    listen: tcp:192.168.0.90:9090\n" +
  "    nat: 'true'\n" +
  "    type: proxy\n" +
  "  foobar:\n" +
  "    id: ababab\n" +
  "    gputype: physical\n" +
  "    type: gpu\n" +
  "";

describe("parseDevices and formDeviceToPayload", () => {
  it("preserves disk, network and custom devices", () => {
    const instance = yamlToObject(deviceYaml) as LxdInstance;
    const formDevices = parseDevices(instance.devices);
    const payload = formDeviceToPayload(formDevices);

    const matchFormDeviceType = (deviceType: string) =>
      Object.values(formDevices).filter((item) => item.type === deviceType);

    expect(matchFormDeviceType("disk").length).toBe(1);
    expect(matchFormDeviceType("nic").length).toBe(1);
    expect(matchFormDeviceType("custom-nic").length).toBe(1);
    expect(matchFormDeviceType("proxy").length).toBe(2);
    expect(matchFormDeviceType("gpu").length).toBe(1);

    const outYaml = objectToYaml({ devices: payload });
    expect(outYaml).toBe(deviceYaml);
  });
});
