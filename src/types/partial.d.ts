export type PartialWithRequired<T, K extends keyof T> = Partial<T> & Pick<T, K>;
