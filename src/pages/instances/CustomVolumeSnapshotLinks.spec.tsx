import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useLocation } from "react-router-dom";
import type { LxdStorageVolume } from "types/storage";
import CustomVolumeSnapshotLinks from "./CustomVolumeSnapshotLinks";

const volume = (name: string): LxdStorageVolume => ({
  name,
  pool: "default",
  project: "default",
  location: "",
  type: "custom",
  content_type: "filesystem",
  config: {},
  created_at: "",
  description: "",
});

const Location = () => {
  const { pathname, search } = useLocation();
  return <span data-testid="location">{pathname + search}</span>;
};

describe("CustomVolumeSnapshotLinks", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("opens a keyboard-accessible dialog with navigable snapshot links", async () => {
    act(() => {
      root.render(
        <MemoryRouter>
          <CustomVolumeSnapshotLinks
            links={[
              {
                deviceLabel: "/data",
                volume: volume("data"),
                snapshotName: "snap0",
              },
              {
                deviceLabel: "/logs",
                volume: volume("logs"),
                snapshotName: "snap1",
              },
            ]}
          />
          <Location />
        </MemoryRouter>,
      );
    });

    const toggle = container.querySelector("button");
    expect(toggle?.getAttribute("aria-expanded")).toBe("false");
    expect(toggle?.getAttribute("aria-haspopup")).toBe("dialog");
    await act(async () => {
      toggle?.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });

    const dialog = document.querySelector('[role="dialog"]');
    expect(toggle?.getAttribute("aria-expanded")).toBe("true");
    expect(dialog?.getAttribute("aria-label")).toBe("Custom disk snapshots");
    const links = dialog?.querySelectorAll<HTMLAnchorElement>("a");
    expect(links).toHaveLength(1);
    expect(dialog?.textContent).toContain("/logs");
    expect(dialog?.textContent).not.toContain("/data");

    act(() => {
      toggle?.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Tab", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(links?.[0]);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(document.querySelector('[role="dialog"]')).toBeNull();
    expect(document.activeElement).toBe(toggle);

    await act(async () => {
      toggle?.click();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
    act(() => {
      document
        .querySelectorAll<HTMLAnchorElement>('[role="dialog"] a')[0]
        .click();
    });
    expect(container.querySelector("[data-testid=location]")?.textContent).toBe(
      "/ui/project/default/storage/pool/default/volumes/custom/logs/snapshots?snapshot=snap1",
    );
  });
});
