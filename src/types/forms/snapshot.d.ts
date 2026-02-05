export type SnapshotFormValues<AdditionalProps = unknown> = {
  name: string;
  expirationDate: string | null;
  expirationTime: string | null;
} & {
  [K in keyof AdditionalProps]: AdditionalProps[K];
};
