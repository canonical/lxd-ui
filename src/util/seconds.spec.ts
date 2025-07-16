import { formatSeconds } from "util/seconds";

describe("formatSeconds", () => {
  it("parses correctly", () => {
    expect(formatSeconds(42)).toBe("42 seconds");
    expect(formatSeconds(60)).toBe("1 minute");
    expect(formatSeconds(61)).toBe("1 minute, 1 second");
    expect(formatSeconds(65)).toBe("1 minute, 5 seconds");
    expect(formatSeconds(3600)).toBe("1 hour");
    expect(formatSeconds(3603)).toBe("1 hour, 3 seconds");
    expect(formatSeconds(86400)).toBe("1 day");
    expect(formatSeconds(86465)).toBe("1 day, 1 minute, 5 seconds");
  });
});
