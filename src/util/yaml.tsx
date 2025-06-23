import { dump as dumpYaml, load as loadYaml } from "js-yaml";

export const yamlToObject = (yamlString: string): object => {
  return loadYaml(yamlString.trim()) as object;
};

export const objectToYaml = (obj: object): string => {
  return dumpYaml(obj, { lineWidth: -1 });
};
