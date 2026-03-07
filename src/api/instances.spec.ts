import type { LxdInstance } from "types/instance";
import {
  fetchInstance,
  fetchInstances,
  instanceSelectiveRecursionFields,
} from "./instances";

describe("fetchInstance", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("keeps the selective recursion field list aligned with UI state consumers", () => {
    expect(instanceSelectiveRecursionFields).toEqual(["state.network"]);
  });

  it("requests selective recursion fields when supported", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ etag: 'W/"etag"' }),
      json: async () =>
        await Promise.resolve({
          metadata: { name: "c1", project: "default" },
        }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await fetchInstance("c1", "default", false, true);

    const [requestUrl] = fetchMock.mock.calls[0] as [string];
    const url = new URL(requestUrl, "http://localhost");

    expect(url.pathname).toBe("/1.0/instances/c1");
    expect(url.searchParams.get("project")).toBe("default");
    expect(url.searchParams.get("recursion")).toBe(
      `2;fields=${instanceSelectiveRecursionFields.join(",")}`,
    );
  });

  it("falls back to plain recursion when selective recursion is unsupported", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      headers: new Headers({ etag: 'W/"etag"' }),
      json: async () =>
        await Promise.resolve({
          metadata: { name: "c1", project: "default" },
        }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await fetchInstance("c1", "default", false, false);

    const [requestUrl] = fetchMock.mock.calls[0] as [string];
    const url = new URL(requestUrl, "http://localhost");

    expect(url.searchParams.get("recursion")).toBe("2");
  });

  it("keeps selective recursion and fetches entitlements separately when access entitlements are requested", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ etag: 'W/"etag-main"' }),
        json: async () =>
          await Promise.resolve({
            metadata: { name: "c1", project: "default", status: "Running" },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ etag: 'W/"etag-entitlements"' }),
        json: async () =>
          await Promise.resolve({
            metadata: {
              name: "c1",
              project: "default",
              access_entitlements: ["can_edit"],
            },
          }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const instance = await fetchInstance("c1", "default", true, true);

    const [instanceRequestUrl] = fetchMock.mock.calls[0] as [string];
    const [entitlementsRequestUrl] = fetchMock.mock.calls[1] as [string];
    const instanceUrl = new URL(instanceRequestUrl, "http://localhost");
    const entitlementsUrl = new URL(entitlementsRequestUrl, "http://localhost");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(instanceUrl.searchParams.get("recursion")).toBe(
      `2;fields=${instanceSelectiveRecursionFields.join(",")}`,
    );
    expect(instanceUrl.searchParams.get("with-access-entitlements")).toBeNull();
    expect(entitlementsUrl.searchParams.get("recursion")).toBeNull();
    expect(
      entitlementsUrl.searchParams.get("with-access-entitlements"),
    ).toBeTruthy();
    expect(instance.access_entitlements).toEqual(["can_edit"]);
  });
});

describe("fetchInstances", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("applies the same selective recursion fields to instance lists", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () =>
        await Promise.resolve({
          metadata: [] as LxdInstance[],
        }),
    });

    vi.stubGlobal("fetch", fetchMock);

    await fetchInstances(null, false, true);

    const [requestUrl] = fetchMock.mock.calls[0] as [string];
    const url = new URL(requestUrl, "http://localhost");

    expect(url.pathname).toBe("/1.0/instances");
    expect(url.searchParams.get("all-projects")).toBe("true");
    expect(url.searchParams.get("recursion")).toBe(
      `2;fields=${instanceSelectiveRecursionFields.join(",")}`,
    );
  });

  it("keeps selective recursion for instance lists and fetches entitlements separately", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            metadata: [
              { name: "c1", project: "default", status: "Running" },
            ] as LxdInstance[],
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () =>
          await Promise.resolve({
            metadata: [
              {
                name: "c1",
                project: "default",
                access_entitlements: ["can_delete"],
              },
            ] as LxdInstance[],
          }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const instances = await fetchInstances("default", true, true);

    const [instanceRequestUrl] = fetchMock.mock.calls[0] as [string];
    const [entitlementsRequestUrl] = fetchMock.mock.calls[1] as [string];
    const instanceUrl = new URL(instanceRequestUrl, "http://localhost");
    const entitlementsUrl = new URL(entitlementsRequestUrl, "http://localhost");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(instanceUrl.searchParams.get("project")).toBe("default");
    expect(instanceUrl.searchParams.get("recursion")).toBe(
      `2;fields=${instanceSelectiveRecursionFields.join(",")}`,
    );
    expect(instanceUrl.searchParams.get("with-access-entitlements")).toBeNull();
    expect(entitlementsUrl.searchParams.get("project")).toBe("default");
    expect(entitlementsUrl.searchParams.get("recursion")).toBe("1");
    expect(
      entitlementsUrl.searchParams.get("with-access-entitlements"),
    ).toBeTruthy();
    expect(instances[0]?.access_entitlements).toEqual(["can_delete"]);
  });
});
