import {
  ALL_PROJECTS,
  getHomeUrl,
  getAllProjectsSwitchTarget,
  getInstancesUrl,
  getOverviewUrl,
  getProjectSwitchTarget,
  getSubpageFromUrl,
} from "./projects";
import { ROOT_PATH } from "util/rootPath";

describe("getOverviewUrl", () => {
  it("returns the all-projects overview url", () => {
    expect(getOverviewUrl(ALL_PROJECTS)).toBe(
      `${ROOT_PATH}/ui/all-projects/overview`,
    );
  });

  it("returns the project overview url", () => {
    expect(getOverviewUrl("my-project")).toBe(
      `${ROOT_PATH}/ui/project/my-project/overview`,
    );
  });

  it("encodes special characters in the project name", () => {
    expect(getOverviewUrl("my project")).toBe(
      `${ROOT_PATH}/ui/project/my%20project/overview`,
    );
  });
});

describe("getInstancesUrl", () => {
  it("returns the all-projects instances url", () => {
    expect(getInstancesUrl(ALL_PROJECTS)).toBe(
      `${ROOT_PATH}/ui/all-projects/instances`,
    );
  });

  it("returns the project instances url", () => {
    expect(getInstancesUrl("my-project")).toBe(
      `${ROOT_PATH}/ui/project/my-project/instances`,
    );
  });
});

describe("getHomeUrl", () => {
  it("returns the overview url when overview is enabled", () => {
    expect(getHomeUrl("my-project", true)).toBe(
      `${ROOT_PATH}/ui/project/my-project/overview`,
    );
  });

  it("returns the instances url when overview is disabled", () => {
    expect(getHomeUrl("my-project", false)).toBe(
      `${ROOT_PATH}/ui/project/my-project/instances`,
    );
  });

  it("returns the all-projects overview url when overview is enabled", () => {
    expect(getHomeUrl(ALL_PROJECTS, true)).toBe(
      `${ROOT_PATH}/ui/all-projects/overview`,
    );
  });

  it("returns the all-projects instances url when overview is disabled", () => {
    expect(getHomeUrl(ALL_PROJECTS, false)).toBe(
      `${ROOT_PATH}/ui/all-projects/instances`,
    );
  });
});

describe("getSubpageFromUrl", () => {
  it("returns undefined for the project root path", () => {
    expect(
      getSubpageFromUrl(`${ROOT_PATH}/ui/project/my-project`),
    ).toBeUndefined();
  });

  it("returns the subpage for the all-projects overview page", () => {
    expect(getSubpageFromUrl(`${ROOT_PATH}/ui/all-projects/overview`)).toBe(
      "overview",
    );
  });

  it("returns the subpage for a known project subpage", () => {
    expect(
      getSubpageFromUrl(`${ROOT_PATH}/ui/project/my-project/instances`),
    ).toBe("instances");
  });

  it("ignores query params", () => {
    expect(
      getSubpageFromUrl(`${ROOT_PATH}/ui/project/my-project/instances?query=1`),
    ).toBe("instances");
  });

  it("returns storage/pools for the storage list page", () => {
    expect(
      getSubpageFromUrl(`${ROOT_PATH}/ui/project/my-project/storage`),
    ).toBe("storage/pools");
  });

  it("returns the storage tab subpage for a storage tab page", () => {
    expect(
      getSubpageFromUrl(`${ROOT_PATH}/ui/project/my-project/storage/volumes`),
    ).toBe("storage/volumes");
  });

  it("returns networks for a network detail page", () => {
    expect(
      getSubpageFromUrl(`${ROOT_PATH}/ui/project/my-project/network/mybr0`),
    ).toBe("networks");
  });

  it("returns undefined for an unknown subpage", () => {
    expect(
      getSubpageFromUrl(`${ROOT_PATH}/ui/project/my-project/unknown`),
    ).toBeUndefined();
  });
});

describe("getProjectSwitchTarget", () => {
  it("keeps the overview subpage when switching from all projects", () => {
    expect(
      getProjectSwitchTarget(
        `${ROOT_PATH}/ui/all-projects/overview`,
        "my-project",
      ),
    ).toBe(`${ROOT_PATH}/ui/project/my-project/overview`);
  });
});

describe("getAllProjectsSwitchTarget", () => {
  it("keeps the overview section when the feature is enabled", () => {
    expect(
      getAllProjectsSwitchTarget(
        `${ROOT_PATH}/ui/project/my-project/overview`,
        true,
      ),
    ).toBe(`${ROOT_PATH}/ui/all-projects/overview`);
  });

  it("keeps the instances section", () => {
    expect(
      getAllProjectsSwitchTarget(
        `${ROOT_PATH}/ui/project/my-project/instances`,
        true,
      ),
    ).toBe(`${ROOT_PATH}/ui/all-projects/instances`);
  });

  it("falls back to the all-projects home page for project-only sections", () => {
    expect(
      getAllProjectsSwitchTarget(
        `${ROOT_PATH}/ui/project/my-project/profiles`,
        false,
      ),
    ).toBe(`${ROOT_PATH}/ui/all-projects/instances`);
  });
});
