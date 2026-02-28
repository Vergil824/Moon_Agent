import { defineConfig, type UserConfigExport } from '@tarojs/cli';
import path from 'path';
import tailwindcss from '@tailwindcss/postcss';
import { UnifiedViteWeappTailwindcssPlugin } from 'weapp-tailwindcss/vite';

import devConfig from './dev';
import prodConfig from './prod';

// Get platform suffix from TARO_ENV for dynamic output directory
// Outputs to: dist/h5, dist/weapp, dist/rn, etc.
const getOutputRoot = () => {
  const env = process.env.TARO_ENV || 'h5';
  return `dist/${env}`;
};

// Check if building for mini program (weapp, alipay, swan, tt, qq, jd)
const isMiniProgram = ['weapp', 'alipay', 'swan', 'tt', 'qq', 'jd'].includes(
  process.env.TARO_ENV || ''
);

/**
 * Fix Tailwind v4 selectors that WXSS parser can't handle.
 *
 * WeChat Mini Program WXSS may fail on modern selectors like `:where(...)`.
 * Tailwind v4 uses `:where(>:not(:last-child))` for `space-y-*` utilities.
 * We rewrite it to a compatible selector.
 */
const weappWxssSelectorFixPlugin = () => ({
  postcssPlugin: 'weapp-wxss-selector-fix',
  Rule(rule: any) {
    if (typeof rule?.selector !== 'string') return;
    if (!rule.selector.includes(':where(>:not(:last-child))')) return;
    rule.selector = rule.selector.replaceAll(
      ':where(>:not(:last-child))',
      '> :not(:last-child)'
    );
  },
});
(weappWxssSelectorFixPlugin as any).postcss = true;

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<'vite'>(async (merge) => {
  const baseConfig: UserConfigExport<'vite'> = {
    projectName: 'moon_agent_taro',
    date: '2026-1-2',
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: 'src',
    outputRoot: getOutputRoot(),
    // Taro plugins (string paths or package names only)
    plugins: ['@tarojs/plugin-generator', '@tarojs/plugin-html'],
    designWidth(input: any) {
      // 配置 NutUI 375 尺寸
      if (input?.file?.replace(/\\+/g, '/').indexOf('@nutui') > -1) {
        return 375;
      }
      // 全局使用 Taro 默认的 750 尺寸
      return 750;
    },
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    // Path aliases for @core and @/* imports
    // Ensures consistent resolution across H5, WeChat Mini Program, and Taro RN
    alias: {
      '@': path.resolve(__dirname, '..', 'src'),
      '@core': path.resolve(__dirname, '..', 'src/core'),
    },
    framework: 'react',
    // Compiler configuration for Taro 4 + Vite
    // FIX (Story 1-5): weapp-tailwindcss must be configured in compiler.vitePlugins,
    // NOT in Taro's plugins array. Taro plugins expect string paths/package names,
    // while vitePlugins accepts actual Vite plugin instances.
    // See: https://github.com/sonofmagic/weapp-tailwindcss/blob/main/website/docs/quick-start/v4/taro-vite.mdx
    compiler: {
      type: 'vite',
      // Vite plugins for mini program builds (weapp-tailwindcss)
      vitePlugins: isMiniProgram
        ? [
            {
              name: 'postcss-config-loader-plugin',
              config(config) {
                // Load TailwindCSS v4 PostCSS plugin for Taro Vite.
                // Reference: weapp-tailwindcss quick-start (taro-vite v4)
                if (typeof config.css?.postcss === 'object') {
                  const postcss = config.css.postcss as any;
                  const plugins = (postcss.plugins = Array.isArray(
                    postcss.plugins
                  )
                    ? postcss.plugins
                    : []);

                  const tw = tailwindcss({ optimize: false }) as any;
                  const twName = (tw as any).postcssPlugin;
                  const hasTw = plugins.some(
                    (p: any) => p?.postcssPlugin === twName
                  );
                  if (!hasTw) {
                    plugins.unshift(tw);
                  }

                  // Insert WXSS selector compatibility fix after Tailwind.
                  const hasWxssFix = plugins.some((p: any) => {
                    if (!p) return false;
                    if (p.postcssPlugin === 'weapp-wxss-selector-fix') return true;
                    if (typeof p === 'function') {
                      try {
                        return p().postcssPlugin === 'weapp-wxss-selector-fix';
                      } catch {
                        return false;
                      }
                    }
                    return false;
                  });
                  if (!hasWxssFix) {
                    const twIndex = plugins.findIndex(
                      (p: any) => p?.postcssPlugin === twName
                    );
                    const insertAt = twIndex >= 0 ? twIndex + 1 : 0;
                    plugins.splice(insertAt, 0, weappWxssSelectorFixPlugin);
                  }
                }
              },
            } as any,
            UnifiedViteWeappTailwindcssPlugin({
              rem2rpx: true,
              // Absolute path to the file that contains `@import "tailwindcss";`
              // Required for tailwindcss@4 so that classnames are transformed correctly.
              cssEntries: [path.resolve(__dirname, '..', 'src', 'app.css')],
              // Taro Vite may drop Tailwind CSS variables; re-inject them for mini program builds.
              injectAdditionalCssVarScope: true,
            }) as any, // Type assertion needed for Taro's vitePlugins type
          ]
        : [],
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    h5: {
      publicPath: '/',
      staticDirectory: 'static',

      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: 'css/[name].[hash].css',
        chunkFilename: 'css/[name].[chunkhash].css',
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: 'module',
            generateScopedName: '[name]__[local]___[hash:base64:5]',
          },
        },
      },
    },
    rn: {
      appName: 'taroDemo',
      postcss: {
        cssModules: {
          enable: false,
        },
      },
    },
  };

  if (process.env.NODE_ENV === 'development') {
    // 本地开发构建配置（不混淆压缩）
    return merge({}, baseConfig, devConfig);
  }
  // 生产构建配置（默认开启压缩混淆等）
  return merge({}, baseConfig, prodConfig);
});
