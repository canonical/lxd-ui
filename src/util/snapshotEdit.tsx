export interface CreateEditSnapshotFormValues {
  name: string;
  stateful: boolean;
  expirationDate: string | null;
  expirationTime: string | null;
}

export const getExpiresAt = (
  expirationDate: string,
  expirationTime: string | null
) => {
  expirationTime = expirationTime ?? "00:00";
  return `${expirationDate}T${expirationTime}`;
};
