export interface IBarrage {
  id: string;
  type: 'top' | 'bottom' | 'left' | 'right';
  text: string;
  time: number;
  color: string;
}

export interface IBarrageResult {
  list: IBarrage[];
  id: string;
}

export interface IBarrageSendOptions {
  id: string;
  type: 'top' | 'bottom' | 'left' | 'right';
  text: string;
  time: number;
  color?: string;
  size?: string;
}
