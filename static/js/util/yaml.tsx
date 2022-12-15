import { load as loadYaml } from "js-yaml";

export const yamlToJson = (yamlString: string): string => {
  const json = loadYaml(yamlString.trim());
  return JSON.stringify(json);
};
