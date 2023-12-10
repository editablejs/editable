import { useMemo } from './use-memo';

export interface RefObject<T> {
  current: T | null;
}
export interface MutableRefObject<T> {
  current: T;
}
export type RefCallback<T> = { bivarianceHack(instance: T | null): void }["bivarianceHack"];
export type Ref<T> = RefObject<T> | RefCallback<T> | null;

export function useRef<T>(initialValue: T): MutableRefObject<T>;
export function useRef<T>(initialValue: T | null): RefObject<T>
export function useRef<T = undefined>(): MutableRefObject<T | undefined>
export function useRef<T = undefined>(initialValue: T | undefined = undefined): MutableRefObject<T | undefined> {
  return useMemo(() => ({
    current: initialValue
  }), []);
}
