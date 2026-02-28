# Brand Fonts

This directory contains custom brand fonts for the Moon Agent Taro application.

## Current Font Strategy

The application currently uses a **system font stack** for optimal cross-platform compatibility:

```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
  'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
  sans-serif;
```

This approach ensures:
- Native look and feel on each platform
- No additional font loading overhead
- Optimal Chinese character rendering

## Adding Custom Brand Fonts

To add a custom brand font:

1. **Place font files here** (`.ttf`, `.woff`, `.woff2`)
2. **Update `app.scss`** with `@font-face` declarations
3. **Configure for each platform**:

### H5 (Web)
Standard `@font-face` works directly.

### WeChat Mini Program
- Use base64 encoded fonts for small files (< 40KB)
- Use `wx.loadFontFace()` for remote fonts
- Configure domain whitelist in WeChat backend

### React Native
- Use `expo-font` or `react-native-asset` to link fonts
- Requires native rebuild after adding fonts

## Recommended Font Formats

| Platform | Recommended Format |
|----------|-------------------|
| H5 | `.woff2` (best compression) |
| WeChat MP | `.ttf` (base64) or remote URL |
| React Native | `.ttf` or `.otf` |

## Example Usage

```scss
// In app.scss
@font-face {
  font-family: 'BrandFont';
  src: url('./assets/fonts/BrandFont.woff2') format('woff2'),
       url('./assets/fonts/BrandFont.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
```

