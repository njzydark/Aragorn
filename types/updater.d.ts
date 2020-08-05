export interface ProgressInfo {
  total: number;
  delta: number;
  transferred: number;
  percent: number;
  bytesPerSecond: number;
}

export type UpdaterChannelData = {
  message: string;
  description?: string;
  percent?: number;
};
