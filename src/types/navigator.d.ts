declare global {
  interface Navigator {
    share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
  }
}

export {};
