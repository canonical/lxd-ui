import type * as helpers from "util/helpers";
import type * as components from "@canonical/react-components";
import type { ClusterLinkFormValues } from "types/forms/clusterLink";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createClusterLink } from "api/cluster-links";
import CreateClusterLinkPanel from "./CreateClusterLinkPanel";

const { clearPanel } = vi.hoisted(() => ({ clearPanel: vi.fn() }));

vi.mock("util/usePanelParams", () => ({
  default: () => ({ clear: clearPanel }),
}));
vi.mock("context/useSupportedFeatures", () => ({
  useSupportedFeatures: () => ({ hasPublicClusterLinks: true }),
}));
vi.mock("context/useAuthGroups", () => ({
  useAuthGroups: () => ({ data: [] }),
}));
vi.mock("pages/permissions/panels/GroupSelection", () => ({
  default: () => null,
}));
vi.mock("pages/cluster/ClusterLinkRichChip", () => ({ default: () => null }));
vi.mock("api/cluster-links", () => ({ createClusterLink: vi.fn() }));
vi.mock("util/helpers", async (importOriginal) => ({
  ...(await importOriginal<typeof helpers>()),
  checkDuplicateName: vi.fn().mockResolvedValue(true),
}));
vi.mock("@canonical/react-components", async (importOriginal) => ({
  ...(await importOriginal<typeof components>()),
  useToastNotification: () => ({ success: vi.fn() }),
}));

describe("CreateClusterLinkPanel", () => {
  let container: HTMLDivElement;
  let root: Root;
  let queryClient: QueryClient;
  const fingerprint = "a".repeat(64);

  const input = (name: string): HTMLInputElement => {
    const element = document.body.querySelector<HTMLInputElement>(
      `input[name="${name}"]`,
    );
    if (!element) throw new Error(`Input ${name} not found`);
    return element;
  };

  const button = (label: string): HTMLButtonElement => {
    const element = [...document.body.querySelectorAll("button")].find(
      (element) => element.textContent === label,
    );
    if (!element) throw new Error(`Button ${label} not found`);
    return element;
  };

  const fill = async (name: string, value: string): Promise<void> => {
    await act(async () => {
      const element = input(name);
      Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value",
      )?.set?.call(element, value);
      element.dispatchEvent(new Event("input", { bubbles: true }));
      await Promise.resolve();
    });
  };

  const click = async (element: HTMLElement | null): Promise<void> => {
    if (!element) throw new Error("Click target not found");
    await act(async () => {
      element.click();
      await Promise.resolve();
    });
    // ActionButton keeps its spinner visible for a minimum of 400ms.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(450);
    });
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true);
    vi.mocked(createClusterLink).mockReset().mockResolvedValue({ fingerprint });
    container = document.createElement("div");
    document.body.append(container);
    root = createRoot(container);
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <CreateClusterLinkPanel />
        </QueryClientProvider>,
      );
      await Promise.resolve();
    });
    await click(
      document.body.querySelector<HTMLInputElement>('input[value="public"]'),
    );
    await fill("remoteAddress", "192.0.2.1:8443");
    await fill("name", "public-images");
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
      await Promise.resolve();
    });
    queryClient.clear();
    container.remove();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  test("fetches inline and confirms with only the name, type and fingerprint", async () => {
    expect(button("Create").getAttribute("aria-disabled")).toBe("true");
    await click(button("Fetch certificate"));
    expect(createClusterLink).toHaveBeenCalledTimes(1);
    expect(JSON.parse(vi.mocked(createClusterLink).mock.calls[0][0])).toEqual({
      name: "public-images",
      description: "",
      type: "public",
      remote_address: "192.0.2.1:8443",
    });
    expect(
      document.body.querySelector("#certificate-fingerprint")?.textContent,
    ).toBe(fingerprint);
    expect(input("name").disabled).toBe(true);
    expect(button("Create").getAttribute("aria-disabled")).toBe("true");
    await click(
      document.body.querySelector<HTMLInputElement>('input[type="checkbox"]'),
    );
    await click(button("Create"));
    expect(createClusterLink).toHaveBeenCalledTimes(2);
    expect(JSON.parse(vi.mocked(createClusterLink).mock.calls[1][0])).toEqual({
      name: "public-images",
      type: "public",
      fingerprint,
    });
    expect(clearPanel).toHaveBeenCalledOnce();
  });

  test("requires a fresh certificate and confirmation after details change", async () => {
    await click(button("Fetch certificate"));
    await click(
      document.body.querySelector<HTMLInputElement>('input[type="checkbox"]'),
    );
    await fill("description", "Updated description");
    expect(document.body.querySelector("#certificate-fingerprint")).toBeNull();
    expect(button("Create").getAttribute("aria-disabled")).toBe("true");
    expect(input("name").disabled).toBe(true);
    await click(button("Fetch certificate"));
    expect(
      (
        JSON.parse(
          vi.mocked(createClusterLink).mock.calls[1][0],
        ) as ClusterLinkFormValues
      ).description,
    ).toBe("Updated description");
    expect(
      document.body.querySelector<HTMLInputElement>('input[type="checkbox"]')
        ?.checked,
    ).toBe(false);
    await click(button("Cancel"));
    expect(createClusterLink).toHaveBeenCalledTimes(2);
    expect(clearPanel).toHaveBeenCalledOnce();
  });

  test("keeps the pending name locked when a successful fetch omits the fingerprint", async () => {
    vi.mocked(createClusterLink).mockResolvedValueOnce(null);
    await click(button("Fetch certificate"));
    expect(document.body.textContent).toContain(
      "The remote server did not return a fingerprint.",
    );
    expect(input("name").disabled).toBe(true);
    expect(button("Create").getAttribute("aria-disabled")).toBe("true");
    await click(button("Fetch certificate"));
    expect(
      document.body.querySelector("#certificate-fingerprint")?.textContent,
    ).toBe(fingerprint);
    expect(createClusterLink).toHaveBeenCalledTimes(2);
  });

  test("shows fetch failures and allows retrying without locking an uncreated link", async () => {
    vi.mocked(createClusterLink).mockRejectedValueOnce(
      new Error("Target unavailable"),
    );
    const invalidate = vi.spyOn(queryClient, "invalidateQueries");
    await click(button("Fetch certificate"));
    expect(document.body.textContent).toContain("Target unavailable");
    expect(input("name").disabled).toBe(false);
    expect(invalidate).not.toHaveBeenCalled();
    await click(button("Fetch certificate"));
    expect(document.body.textContent).not.toContain("Target unavailable");
    expect(
      document.body.querySelector("#certificate-fingerprint")?.textContent,
    ).toBe(fingerprint);
  });

  test("does not reuse an older certificate after a malformed refresh", async () => {
    await click(button("Fetch certificate"));
    await fill("remoteAddress", "192.0.2.2:8443");
    vi.mocked(createClusterLink).mockResolvedValueOnce(null);
    await click(button("Fetch certificate"));
    await fill("remoteAddress", "192.0.2.1:8443");
    expect(document.body.querySelector("#certificate-fingerprint")).toBeNull();
    expect(button("Create").getAttribute("aria-disabled")).toBe("true");
    expect(input("name").disabled).toBe(true);
  });

  test("does not confirm an unchecked fingerprint through native form submission", async () => {
    await click(button("Fetch certificate"));
    await act(async () => {
      document.body
        .querySelector("form")
        ?.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true }),
        );
      await Promise.resolve();
    });
    expect(createClusterLink).toHaveBeenCalledTimes(1);
    expect(clearPanel).not.toHaveBeenCalled();
  });

  test("retains the certificate and allows retrying a failed confirmation", async () => {
    await click(button("Fetch certificate"));
    vi.mocked(createClusterLink).mockRejectedValueOnce(
      new Error("Confirmation failed"),
    );
    await click(
      document.body.querySelector<HTMLInputElement>('input[type="checkbox"]'),
    );
    await click(button("Create"));
    expect(document.body.textContent).toContain("Confirmation failed");
    expect(clearPanel).not.toHaveBeenCalled();
    expect(
      document.body.querySelector("#certificate-fingerprint")?.textContent,
    ).toBe(fingerprint);
    await click(button("Create"));
    expect(createClusterLink).toHaveBeenCalledTimes(3);
    expect(clearPanel).toHaveBeenCalledOnce();
  });

  test("opens a stored pending certificate without sending another create request", async () => {
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <CreateClusterLinkPanel
            key="pending"
            pendingLink={{
              name: "pending-images",
              description: "",
              type: "public",
              config: {
                "volatile.pending_address": "192.0.2.2:8443",
                "volatile.pending_certificate":
                  "-----BEGIN CERTIFICATE-----\nAA==\n-----END CERTIFICATE-----",
              },
            }}
          />
        </QueryClientProvider>,
      );
      await Promise.resolve();
    });
    expect(
      document.body.querySelector("#certificate-fingerprint")?.textContent,
    ).toMatch(/^[0-9a-f]{64}$/);
    expect(
      document.body.querySelector("#remote-address")?.textContent,
    ).toContain("192.0.2.2:8443");
    expect(createClusterLink).not.toHaveBeenCalled();
    await click(button("Cancel"));
    expect(createClusterLink).not.toHaveBeenCalled();
    expect(clearPanel).toHaveBeenCalledOnce();
  });
});
