import { pluralize } from "./instanceBulkActions";

describe("pluralize function", () => {
  describe("count of 1", () => {
    it("should return the original word unchanged", () => {
      expect(pluralize("volume", 1)).toBe("volume");
      expect(pluralize("GPU", 1)).toBe("GPU");
      expect(pluralize("Identity", 1)).toBe("Identity");
    });
  });

  describe("regular pluralization", () => {
    it("should add 's' to lowercase words", () => {
      expect(pluralize("volume", 2)).toBe("volumes");
      expect(pluralize("disk", 3)).toBe("disks");
      expect(pluralize("other", 5)).toBe("others");
    });

    it("should add 's' to capitalized words", () => {
      expect(pluralize("Volume", 2)).toBe("Volumes");
      expect(pluralize("Disk", 3)).toBe("Disks");
      expect(pluralize("Other", 5)).toBe("Others");
    });

    it("should add 'S' to all-uppercase words", () => {
      expect(pluralize("USB", 2)).toBe("USBS");
      expect(pluralize("PCI", 3)).toBe("PCIS");
      expect(pluralize("TPM", 5)).toBe("TPMS");
    });
  });

  describe("exception cases", () => {
    describe("identity -> identities", () => {
      it("should handle lowercase", () => {
        expect(pluralize("identity", 2)).toBe("identities");
      });

      it("should handle capitalized", () => {
        expect(pluralize("Identity", 2)).toBe("Identities");
      });

      it("should handle all-uppercase", () => {
        expect(pluralize("IDENTITY", 2)).toBe("IDENTITIES");
      });
    });

    describe("proxy -> proxies", () => {
      it("should handle lowercase", () => {
        expect(pluralize("proxy", 2)).toBe("proxies");
      });

      it("should handle capitalized", () => {
        expect(pluralize("Proxy", 2)).toBe("Proxies");
      });

      it("should handle all-uppercase", () => {
        expect(pluralize("PROXY", 2)).toBe("PROXIES");
      });
    });

    describe("gpu -> gpus", () => {
      it("should handle lowercase", () => {
        expect(pluralize("gpu", 2)).toBe("gpus");
      });

      it("should handle capitalized", () => {
        expect(pluralize("Gpu", 2)).toBe("Gpus");
      });

      it("should handle all-uppercase", () => {
        expect(pluralize("GPU", 2)).toBe("GPUs");
      });
    });
  });

  describe("edge cases", () => {
    it("should handle empty string", () => {
      expect(pluralize("", 2)).toBe("");
    });

    it("should handle count of 0", () => {
      expect(pluralize("volume", 0)).toBe("volumes");
    });
  });
});
