import { execSync } from "child_process";

// sudo-rs (Ubuntu 26.04) ignores -E, so the needed variables are listed.
const PRESERVED_ENV = [
  "DEPLOYMENT",
  "GOCOVERDIR",
  "HOME",
  "LD_LIBRARY_PATH",
  "LXD_DIR",
  "PATH",
].join(",");

export const runCommand = (command: string) => {
  console.log("Running command: ", command);
  const result = execSync(
    `sudo --preserve-env=${PRESERVED_ENV} ${command}`,
  ).toString();
  console.log("Result: ", result);
  return result;
};
