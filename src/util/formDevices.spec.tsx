import { formDeviceToPayload, parseDevices } from "./formDevices";
import { yamlToObject } from "./yaml";
import { LxdInstance } from "types/instance";
import { dump as dumpYaml } from "js-yaml";

const deviceYaml =
  "devices:\n" +
  "  root:\n" +
  "    path: /\n" +
  "    pool: big-pool\n" +
  "    type: disk\n" +
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
    expect(matchFormDeviceType("unknown").length).toBe(2);

    const outYaml = dumpYaml({ devices: payload });
    expect(outYaml).toBe(deviceYaml);
  });
});
