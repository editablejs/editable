import { isServer } from "./is-server";

export const isTouchDevice = !isServer && 'ontouchstart' in document.documentElement
