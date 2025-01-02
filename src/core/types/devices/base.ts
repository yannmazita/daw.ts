// src/core/types/devices/base.ts

export interface Device<T = any> {
  id: string;
  type: string;
  name: string;
  bypass: boolean;
  options?: T;
}
