import { getReportBugBodyTemplate } from "./reportBug";

describe("report bug body template", () => {
  it("should contain all required sections and subsections", () => {
    const body = getReportBugBodyTemplate();
    expect(body).toContain("# Description");
    expect(body).toContain("# Metadata");
    expect(body).toContain("UI Version");
    expect(body).toContain("Path");
  });

  it("should handle undefined error", () => {
    const body = getReportBugBodyTemplate();
    expect(body).not.toContain("# Stacktrace");
  });

  it("should display error stack when provided", () => {
    const error = new Error("Something bad happened");
    error.stack = "Something went terribly wrong";
    const body = getReportBugBodyTemplate(error);
    expect(body).toContain("Something went terribly wrong");
  });

  it("should handle undefined stack", () => {
    const error = new Error();
    error.stack = undefined;
    const body = getReportBugBodyTemplate(error);
    expect(body).not.toContain("# Stacktrace");
  });

  it("should have consistent layout regardless of the error", () => {
    const error = new Error("Something bad happened");
    error.stack = "Something went terribly wrong";
    const body1 = getReportBugBodyTemplate(error);
    const body2 = getReportBugBodyTemplate();
    const nonErrorSections = (body: string) => {
      return body.split("# Stacktrace")[0].trim();
    };
    expect(nonErrorSections(body1)).toBe(nonErrorSections(body2));
  });
});
