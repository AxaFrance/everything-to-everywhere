import { defineConfig } from '@rslib/core';
import { pluginReact } from '@rsbuild/plugin-react'; 

export default defineConfig({
  lib: [
    {
      format: 'esm',
      syntax: ['node 18'],
      dts: true,
    },
    {
      format: 'cjs',
      syntax: ['node 18'],
    },
  ],
  output: {
    target: 'web'
  },
  plugins: [pluginReact()]
});
