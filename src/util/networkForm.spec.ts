import { toNetwork } from "pages/networks/forms/NetworkForm";
import { LxdNetwork } from "types/network";
import { toNetworkFormValues } from "util/networkForm";

describe("conversion to form values and back with toNetworkFormValues and toNetwork", () => {
  it("preserves custom top level network setting field", () => {
    type CustomPayload = LxdNetwork & { "custom-key": string };
    const network = {
      config: {},
      "custom-key": "custom-value",
    } as unknown as LxdNetwork;

    const formValues = toNetworkFormValues(network);
    const payload = toNetwork(formValues) as CustomPayload;

    expect(payload["custom-key"]).toBe("custom-value");
  });

  it("preserves custom config level network setting field", () => {
    const network = {
      devices: {},
      config: {
        "user.key": "custom-config-value",
      },
    } as unknown as LxdNetwork;

    const formValues = toNetworkFormValues(network);
    const payload = toNetwork(formValues);

    expect(payload.config?.["user.key"]).toBe("custom-config-value");
  });

  it("preserves volatile keys in network config", () => {
    const network = {
      devices: {},
      config: {
        "user.key": "custom-config-value",
        "volatile.network.ipv4.address": "1.2.3.4",
      },
    } as unknown as LxdNetwork;

    const formValues = toNetworkFormValues(network);
    const payload = toNetwork(formValues);

    expect(payload.config?.["volatile.network.ipv4.address"]).toBe("1.2.3.4");
  });
});
