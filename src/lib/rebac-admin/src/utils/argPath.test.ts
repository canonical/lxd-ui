import { argPath } from "./argPath";

test("can handle a URL parameter", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/:id"),
  };
  expect(urls.machine({ id: 99 })).toBe("/machine/99");
});

test("can get the unmodified URL with parameters", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/:id"),
  };
  expect(urls.machine(null)).toBe("/machine/:id");
});

test("can create a relative url", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/details/:id"),
  };
  expect(urls.machine({ id: 99 }, "/machine")).toBe("details/99");
});

test("can create a relative url with parameters", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/:id/details"),
  };
  expect(urls.machine(null, "/machine/:id")).toBe("details");
});

test("can create a relative url that has a trailing slash", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/details/:id"),
  };
  expect(urls.machine({ id: 99 }, "/machine/")).toBe("details/99");
});

test("can create a relative url that does not have a trailing slash", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/details/:id"),
  };
  expect(urls.machine({ id: 99 }, "/machine")).toBe("details/99");
});

test("can handle a relative url that matches the generated URL with a trailing slash", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/:id"),
  };
  expect(urls.machine({ id: 99 }, "/machine/99/")).toBe("");
});

test("can handle a relative url that matches the generated URL without a trailing slash", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/:id"),
  };
  expect(urls.machine({ id: 99 }, "/machine/99")).toBe("");
});

test("does not replace more than once instance of the base url", () => {
  const urls = {
    machine: argPath<{ id: number }>("/machine/details/machine/:id"),
  };
  expect(urls.machine({ id: 99 }, "/machine")).toBe("details/machine/99");
});
