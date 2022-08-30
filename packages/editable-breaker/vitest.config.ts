import { mergeConfig } from 'vite';
import baseConfig from '../../vitest.config';

export default mergeConfig(baseConfig, {
  test: {
    include: ['test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
  },
});
