import type { Player } from '@oplayer/core';

export interface PlayerAdapter extends Player {
  storage?: {
    set: (key: string, value: any) => void;
    get: (key: string) => any;
  };
}
