import { Buffer } from 'buffer';
import 'core-js/stable';

window.global = window;
window.Buffer = Buffer;

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};
