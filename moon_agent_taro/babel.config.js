// babel-preset-taro 更多选项和默认值：
// https://docs.taro.zone/docs/next/babel-config
export default {
  presets: [
    [
      'taro',
      {
        framework: 'react',
        ts: true,
        compiler: 'vite',
      },
    ],
  ],
  plugins: [
    [
      'import',
      {
        libraryName: '@nutui/nutui-react-taro',
        libraryDirectory: 'dist/esm',
        style: 'css',
        camel2DashComponentName: false,
      },
      'nutui-react-taro',
    ],
  ],
};
