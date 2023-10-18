// ARCHITECTURE_NAMES and ARCHITECTURE_ALIASES come from https://github.com/lxc/lxd/blob/HEAD/shared/osarch/architectures.go
const ARCHITECTURE_NAMES: Record<string, string> = {
  ARCH_32BIT_INTEL_X86: "i686",
  ARCH_64BIT_INTEL_X86: "x86_64",
  ARCH_32BIT_ARMV6_LITTLE_ENDIAN: "armv6l",
  ARCH_32BIT_ARMV7_LITTLE_ENDIAN: "armv7l",
  ARCH_32BIT_ARMV8_LITTLE_ENDIAN: "armv8l",
  ARCH_64BIT_ARMV8_LITTLE_ENDIAN: "aarch64",
  ARCH_32BIT_POWERPC_BIG_ENDIAN: "ppc",
  ARCH_64BIT_POWERPC_BIG_ENDIAN: "ppc64",
  ARCH_64BIT_POWERPC_LITTLE_ENDIAN: "ppc64le",
  ARCH_64BIT_S390_BIG_ENDIAN: "s390x",
  ARCH_32BIT_MIPS: "mips",
  ARCH_64BIT_MIPS: "mips64",
  ARCH_32BIT_RISCV_LITTLE_ENDIAN: "riscv32",
  ARCH_64BIT_RISCV_LITTLE_ENDIAN: "riscv64",
};

const ARCHITECTURE_ALIASES: Record<string, string[]> = {
  ARCH_32BIT_INTEL_X86: ["i386", "i586", "386", "x86", "generic_32"],
  ARCH_64BIT_INTEL_X86: ["amd64", "generic_64"],
  ARCH_32BIT_ARMV6_LITTLE_ENDIAN: ["armel", "arm"],
  ARCH_32BIT_ARMV7_LITTLE_ENDIAN: [
    "armhf",
    "armhfp",
    "armv7a_hardfp",
    "armv7",
    "armv7a_vfpv3_hardfp",
  ],
  ARCH_32BIT_ARMV8_LITTLE_ENDIAN: [],
  ARCH_64BIT_ARMV8_LITTLE_ENDIAN: ["arm64", "arm64_generic"],
  ARCH_32BIT_POWERPC_BIG_ENDIAN: ["powerpc"],
  ARCH_64BIT_POWERPC_BIG_ENDIAN: ["powerpc64", "ppc64"],
  ARCH_64BIT_POWERPC_LITTLE_ENDIAN: ["ppc64el"],
  ARCH_32BIT_MIPS: ["mipsel", "mipsle"],
  ARCH_64BIT_MIPS: ["mips64el", "mips64le"],
  ARCH_32BIT_RISCV_LITTLE_ENDIAN: [],
  ARCH_64BIT_RISCV_LITTLE_ENDIAN: [],
};

export const getArchitectureAliases = (names: string[]): string[] => {
  const aliases: string[] = [];
  names.map((value) => {
    const key = Object.keys(ARCHITECTURE_NAMES).find(
      (key) => ARCHITECTURE_NAMES[key] === value,
    );
    if (key) {
      aliases.push(...ARCHITECTURE_ALIASES[key]);
    }
  });
  return aliases;
};
