import { load as loadYaml } from "js-yaml";

export const yamlToObject = (yamlString: string): object => {
  return loadYaml(yamlString.trim());
};

export const yamlToJson = (yamlString: string): string => {
  const json = yamlToObject(yamlString);
  return JSON.stringify(json);
};
