export interface IVideoOptions {
  url: string;
  playEnd: boolean;
  watchTime: number;
  duration: number;
  skipTimeInStart: number;
  skipTimeInEnd: number;
}

export interface IVideoProcess {
  currentTime: number;
  duration: number;
}
