import type { InstanceAndProfileFormikProps } from "components/forms/instanceAndProfileFormValues";
import type { FormDevice } from "./formDevices";
import {
  addNicDevice,
  addNoneDevice,
  formDeviceToPayload,
  parseDevices,
  removeNicDevice,
} from "./formDevices";
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
  "    network: mybr\n" +
  "    type: nic\n" +
  "  eth2:\n" +
  "    ipv4.address: 10.76.172.21\n" +
  "    network: mybr1\n" +
  "    type: nic\n" +
  "    hostname: myhost\n" +
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
    expect(matchFormDeviceType("nic").length).toBe(2);
    expect(matchFormDeviceType("custom-nic").length).toBe(1);
    expect(matchFormDeviceType("proxy").length).toBe(2);
    expect(matchFormDeviceType("gpu").length).toBe(1);

    const outYaml = objectToYaml({ devices: payload });
    expect(outYaml).toBe(deviceYaml);
  });
});

const createMockFormik = (devices: FormDevice[]) =>
  ({
    values: {
      devices: devices,
    },
    setFieldValue: vi.fn(),
  }) as unknown as InstanceAndProfileFormikProps;

describe("addNoneDevice", () => {
  it('should add a "none" device to an empty list', () => {
    const mockFormik = createMockFormik([]);
    const deviceName = "eth0";

    const expectedNewDevice = {
      type: "none",
      name: deviceName,
    };

    addNoneDevice(deviceName, mockFormik);

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", [
      expectedNewDevice,
    ]);
  });

  it('should add a "none" device to an existing list of devices', () => {
    const initialDevices: FormDevice[] = [{ name: "root", type: "disk" }];
    const mockFormik = createMockFormik(initialDevices);
    const deviceName = "eth0";

    const expectedNewDevice = {
      type: "none",
      name: deviceName,
    };

    addNoneDevice(deviceName, mockFormik);

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", [
      ...initialDevices,
      expectedNewDevice,
    ]);
  });

  it("should replace an existing device with the same name", () => {
    const deviceName = "eth0";
    const initialDevices: FormDevice[] = [
      { name: "root", type: "disk" },
      { name: deviceName, type: "nic", network: "lxdbr0" },
      { name: "eth-1", type: "nic", network: "lxdbr1" },
    ];
    const mockFormik = createMockFormik(initialDevices);

    const expectedNewDevice = {
      type: "none",
      name: deviceName,
    };

    addNoneDevice(deviceName, mockFormik);

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", [
      { name: "root", type: "disk" },
      { name: "eth-1", type: "nic", network: "lxdbr1" },
      expectedNewDevice,
    ]);
  });
});

describe("addNicDevice", () => {
  it("should add a new NIC device to an empty list", () => {
    const mockFormik = createMockFormik([]);
    const deviceName = "eth0";
    const deviceNetworkName = "lxdbr0";

    const expectedNewDevice = {
      type: "nic",
      name: deviceName,
      network: deviceNetworkName,
    };

    addNicDevice({
      formik: mockFormik,
      deviceName,
      deviceNetworkName,
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", [
      expectedNewDevice,
    ]);
  });

  it("should append a new NIC device to an existing list", () => {
    const existingDevice: FormDevice = { type: "disk", name: "root" };
    const mockFormik = createMockFormik([existingDevice]);
    const deviceName = "eth1";
    const deviceNetworkName = "ovn-net";

    const expectedNewDevice = {
      type: "nic",
      name: deviceName,
      network: deviceNetworkName,
    };

    addNicDevice({
      formik: mockFormik,
      deviceName,
      deviceNetworkName,
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", [
      existingDevice,
      expectedNewDevice,
    ]);
  });

  it("should replace none device with same name if exists in list", () => {
    const existingNicDevice: FormDevice = {
      type: "nic",
      name: "eth0",
      network: "lxdbr0",
    };
    const deviceName = "eth1";
    const deviceNetworkName = "ovn-net";
    const existingNoneDevice: FormDevice = { type: "none", name: deviceName };
    const mockFormik = createMockFormik([
      existingNicDevice,
      existingNoneDevice,
    ]);

    const expectedNewDevice = {
      type: "nic",
      name: deviceName,
      network: deviceNetworkName,
    };

    addNicDevice({
      formik: mockFormik,
      deviceName,
      deviceNetworkName,
    });

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", [
      existingNicDevice,
      expectedNewDevice,
    ]);
  });
});

describe("removeNicDevice", () => {
  it("should remove a device from the list", () => {
    const initialDevices: FormDevice[] = [
      { name: "eth0", type: "nic" },
      { name: "root", type: "disk" },
    ];
    const mockFormik = createMockFormik(initialDevices);

    removeNicDevice({ formik: mockFormik, deviceName: "eth0" });

    const expectedDevices = [{ name: "root", type: "disk" }];

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith(
      "devices",
      expectedDevices,
    );
  });

  it("should not change the list if the device is not found", () => {
    const initialDevices: FormDevice[] = [
      { name: "eth0", type: "nic" },
      { name: "root", type: "disk" },
    ];
    const mockFormik = createMockFormik(initialDevices);

    removeNicDevice({ formik: mockFormik, deviceName: "usb0" });
    const expectedDevices = [...initialDevices];

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith(
      "devices",
      expectedDevices,
    );
  });

  it("should result in an empty list if the only device is removed", () => {
    const initialDevices: FormDevice[] = [{ name: "eth0", type: "nic" }];
    const mockFormik = createMockFormik(initialDevices);

    removeNicDevice({ formik: mockFormik, deviceName: "eth0" });

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", []);
  });

  it("should not throw an error on an empty list", () => {
    const initialDevices: FormDevice[] = [];
    const mockFormik = createMockFormik(initialDevices);

    removeNicDevice({ formik: mockFormik, deviceName: "eth0" });

    expect(mockFormik.setFieldValue).toHaveBeenCalledTimes(1);
    expect(mockFormik.setFieldValue).toHaveBeenCalledWith("devices", []);
  });
});
