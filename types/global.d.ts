export {};

declare global {
  interface Window {
    google: any;
    handleGoogleCallback: (response: any) => Promise<void>;
  }
}
