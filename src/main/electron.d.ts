declare global {
  namespace Electron {
    interface App {
      isQuitting: boolean;
    }
  }
}

export {};
