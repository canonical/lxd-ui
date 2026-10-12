import {
  canonicalServer,
  imagesLxdServer,
  loadRemoteImagesLegacy,
  minimalServer,
} from "util/imageLegacy";

const jsonResponse = (data: unknown) =>
  ({
    ok: true,
    json: vi.fn<() => Promise<unknown>>().mockResolvedValue(data),
  }) as unknown as Response;

const errorResponse = (message: string) =>
  ({
    ok: false,
    status: 404,
    json: vi.fn<() => Promise<unknown>>().mockResolvedValue({ error: message }),
  }) as unknown as Response;

const product = { os: "ubuntu", arch: "amd64", release: "jammy" };
const products = { products: { p1: product } };

const stubFetch = (response: Response) => {
  const fetchMock = vi
    .fn<() => Promise<Response>>()
    .mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("loadRemoteImagesLegacy", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads images from all sources by default", async () => {
    const fetchMock = stubFetch(jsonResponse(products));

    const result = await loadRemoteImagesLegacy();

    // one request for each of the three built-in sources
    // (ubuntu, ubuntu minimal and lxd images)
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(result.error).toBe("");
    expect(result.images.map((image) => image.server)).toEqual([
      canonicalServer,
      minimalServer,
      imagesLxdServer,
    ]);
  });

  it("loads images only from the requested server", async () => {
    const fetchMock = stubFetch(jsonResponse(products));

    const result = await loadRemoteImagesLegacy(imagesLxdServer);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://images.lxd.canonical.com/streams/v1/images.json",
    );
    expect(result.error).toBe("");
    expect(result.images).toHaveLength(1);
    expect(result.images[0].server).toBe(imagesLxdServer);
  });

  it("returns only the error of the requested source", async () => {
    stubFetch(errorResponse("not found"));

    const result = await loadRemoteImagesLegacy(minimalServer);

    expect(result.images).toEqual([]);
    expect(result.error).toBe("not found");
  });
});
