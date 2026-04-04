declare module "@env" {
  export const TROOTT_API_URL_LOCAL: string;
  export const TROOTT_API_URL_PROD: string;
  // Add other environment variables here

  // Allow importing any string-based environment variable
  declare const env: { [key: string]: string };
  export = env;
}
