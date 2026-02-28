export default defineAppConfig({
  pages: [
    // TabBar pages must be first (WeChat Mini Program requirement)
    'pages/chat/index',
    'pages/cart/index',
    'pages/profile/index',
    // Auth pages
    'pages/welcome/index',
    'pages/index/index',
    'pages/login/index',
    // Checkout & Payment flow
    'pages/checkout/index',
    'pages/pay/submit/index',
    'pages/pay/result/index',
    // Profile sub-pages
    'pages/profile/addresses/index',
    'pages/profile/addresses/edit/index',
    'pages/profile/orders/index',
    'pages/profile/settings/index',
    'pages/profile/settings/edit-profile/index',
    'pages/profile/settings/change-password/index',
    // Dev/Test pages (hidden in production)
    'pages/ui-smoke/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '撑撑姐',
    navigationBarTextStyle: 'black',
  },
  tabBar: {
    color: '#6b7280',
    selectedColor: '#8b5cf6',
    backgroundColor: '#ffffff',
    borderStyle: 'black',
    list: [
      {
        pagePath: 'pages/chat/index',
        text: '智能顾问',
      },
      {
        pagePath: 'pages/cart/index',
        text: '购物车',
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的',
      },
    ],
  },
});
