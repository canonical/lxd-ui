declare module "js-yaml" {
  export function load(yaml: string): JSON;
  export function dump(json: object): string;
}
