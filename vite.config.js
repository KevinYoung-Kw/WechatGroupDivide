import { defineConfig } from 'vite'
import Obfuscator from 'rollup-plugin-obfuscator'

export default defineConfig({
  server: {
    port: 3000,
  },
  preview: {
    port: 8050,
    host: true, // 允许网络访问
    allowedHosts: ['wxdiv.kevinyoung0210.me', 'localhost']
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  base: './',
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
  },
  plugins: [
    Obfuscator({
      // 混淆器选项
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.75,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.4,
        debugProtection: false,
        disableConsoleOutput: true,
        identifierNamesGenerator: 'hexadecimal',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 10,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayEncoding: ['base64'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.75,
        transformObjectKeys: true,
        unicodeEscapeSequence: false
      },
      // 不混淆第三方库的代码
      exclude: ['node_modules/**']
    })
  ]
}) 