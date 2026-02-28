import type { UserConfigExport } from "@tarojs/cli";

// Backend server URL for development
// NOTE: For weapp testing, you may need to use your computer's local IP instead of localhost
// e.g., "http://192.168.1.100:48080" if testing on real device
const DEV_BACKEND_URL = "http://localhost:48080";

// Detect platform at config time
// TARO_ENV is set by Taro CLI before config is loaded
const taroEnv = process.env.TARO_ENV;
const isH5 = taroEnv === "h5";
const isMiniProgram = ['weapp', 'alipay', 'swan', 'tt', 'qq', 'jd'].includes(taroEnv || '');

// Debug: print env info during build
console.log(`[dev.ts] TARO_ENV=${taroEnv}, isH5=${isH5}, isMiniProgram=${isMiniProgram}`);

// Determine API base URL:
// - H5 uses relative path (proxied by dev server)
// - Mini programs need full URL (no proxy available)
const apiBase = isH5 ? "/app-api" : `${DEV_BACKEND_URL}/app-api`;
console.log(`[dev.ts] TARO_APP_API_BASE=${apiBase}`);

export default {
  // Define environment constants for development
  defineConstants: {
    TARO_APP_API_BASE: JSON.stringify(apiBase),
    TARO_APP_TENANT_ID: JSON.stringify("1"),
    TARO_APP_ENV: JSON.stringify("development"),
  },
  mini: {},
  h5: {
    devServer: {
      // Proxy /app-api requests to backend server to avoid CORS issues
      proxy: {
        "/app-api": {
          target: DEV_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/app-api/, "/app-api"),
        },
      },
    },
  },
} satisfies UserConfigExport<"vite">;
