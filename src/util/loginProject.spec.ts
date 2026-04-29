import {
  loadLoginProject,
  saveLoginProject,
  getDefaultProject,
  getLoginProject,
  LOCAL_STORAGE_KEY,
} from "util/loginProject";
import { ALL_PROJECTS } from "util/projects";
import type { LxdProject } from "types/project";

const mockProject = (name: string): LxdProject => ({ name }) as LxdProject;

beforeEach(() => {
  localStorage.clear();
});

describe("loadLoginProject", () => {
  it("returns undefined when nothing is stored", () => {
    expect(loadLoginProject()).toBeUndefined();
  });

  it("returns the stored value", () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, "myproject");
    expect(loadLoginProject()).toBe("myproject");
  });
});

describe("saveLoginProject", () => {
  it("persists the project name", () => {
    saveLoginProject("project1");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("project1");
  });

  it("overwrites a previously saved value", () => {
    saveLoginProject("first");
    saveLoginProject("second");
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe("second");
  });

  it("persists ALL_PROJECTS sentinel value", () => {
    saveLoginProject(ALL_PROJECTS);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBe(ALL_PROJECTS);
  });
});

describe("getDefaultProject", () => {
  it("returns 'default' when the project list is empty", () => {
    expect(getDefaultProject([])).toBe("default");
  });

  it("returns 'default' when a project named 'default' exists", () => {
    const projects = [
      mockProject("alpha"),
      mockProject("default"),
      mockProject("beta"),
    ];
    expect(getDefaultProject(projects)).toBe("default");
  });

  it("returns the first project when no project is named 'default'", () => {
    const projects = [mockProject("alpha"), mockProject("beta")];
    expect(getDefaultProject(projects)).toBe("alpha");
  });
});

describe("getLoginProject", () => {
  const projects = [mockProject("default"), mockProject("project2")];

  it("returns ALL_PROJECTS when ALL_PROJECTS is saved", () => {
    saveLoginProject(ALL_PROJECTS);
    expect(getLoginProject(projects)).toBe(ALL_PROJECTS);
  });

  it("returns the saved project when it exists in the project list", () => {
    saveLoginProject("project2");
    expect(getLoginProject(projects)).toBe("project2");
  });

  it("falls back to default when the saved project is not in the list", () => {
    saveLoginProject("missing-project");
    expect(getLoginProject(projects)).toBe("default");
  });

  it("falls back to default when nothing is saved", () => {
    expect(getLoginProject(projects)).toBe("default");
  });

  it("falls back to first project when saved project is absent and no 'default' project exists", () => {
    saveLoginProject("missing");
    const noDefault = [mockProject("alpha"), mockProject("beta")];
    expect(getLoginProject(noDefault)).toBe("alpha");
  });

  it("falls back to 'default' string when project list is empty and nothing is saved", () => {
    expect(getLoginProject([])).toBe("default");
  });
});
