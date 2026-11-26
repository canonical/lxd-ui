import { act, type FC } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Link, MemoryRouter } from "react-router-dom";
import type { MainTableRow } from "@canonical/react-components/dist/components/MainTable/MainTable";
import HighlightedSnapshotPagination from "./HighlightedSnapshotPagination";

const rows = Array.from({ length: 60 }, (_, index) => ({
  name: `snapshot-${index}`,
}));

const Table: FC<{ rows?: MainTableRow[] }> = ({ rows = [] }) => (
  <ul>
    {rows.map((row) => (
      <li key={row.name} className={row.className ?? undefined}>
        {row.name}
      </li>
    ))}
  </ul>
);

describe("HighlightedSnapshotPagination", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
    Element.prototype.scrollIntoView = vi.fn();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    act(() => {
      root.render(
        <MemoryRouter
          initialEntries={["/instance/snapshots?snapshot=snapshot-55"]}
        >
          <Link to="/instance/snapshots">Clear snapshot</Link>
          <Link to="/instance/snapshots?snapshot=snapshot-55">
            Open snapshot
          </Link>
          <Link to="/other/snapshots?snapshot=snapshot-55">
            Open other instance
          </Link>
          <HighlightedSnapshotPagination rows={rows} description={null}>
            <Table />
          </HighlightedSnapshotPagination>
        </MemoryRouter>,
      );
    });
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  const click = (selector: string) => {
    const element = container.querySelector<HTMLElement>(selector);
    if (!element) {
      throw new Error(`Missing element: ${selector}`);
    }
    act(() => {
      element.click();
    });
  };

  const firstRow = () => container.querySelector("li")?.textContent;

  it("opens the page of the linked snapshot and highlights it", () => {
    expect(firstRow()).toBe("snapshot-50");
    expect(container.querySelector(".is-highlighted")?.textContent).toBe(
      "snapshot-55",
    );
  });

  it("still allows manual page changes", () => {
    click("[aria-label='Previous page']");
    expect(firstRow()).toBe("snapshot-0");
  });

  it("reopens the linked page after the parameter is cleared", () => {
    click("[aria-label='Previous page']");
    click('a[href="/instance/snapshots"]');
    click('a[href="/instance/snapshots?snapshot=snapshot-55"]');
    expect(firstRow()).toBe("snapshot-50");
  });

  it("opens the linked page for a different resource with the same snapshot name", () => {
    click("[aria-label='Previous page']");
    click('a[href="/other/snapshots?snapshot=snapshot-55"]');
    expect(firstRow()).toBe("snapshot-50");
  });
});
