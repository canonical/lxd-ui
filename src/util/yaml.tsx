import { load as loadYaml } from "js-yaml";

export const yamlToObject = (yamlString: string): object => {
  return loadYaml(yamlString.trim());
};
