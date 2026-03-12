export type TSources = {
  path: PropertyKey;
  message: string;
}[];

export type TErrorResponse = {
  status: number;
  message: string;
  sources: TSources;
};
