export interface PlacementGroupFormValues {
  name?: string;
  description?: string;
  policy?: "compact" | "spread";
  rigor?: "strict" | "permissive";
}
