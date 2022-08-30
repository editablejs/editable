import { mergeConfig } from 'vite';
import baseConfig from '../../vitest.config';

export default mergeConfig(baseConfig, {
  plugins: [],
});
