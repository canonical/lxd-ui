export interface LxdPlacementGroup {
  name: string;
  description: string;
  config: {
    policy: "compact" | "spread";
    rigor: "strict" | "permissive";
  };
}
