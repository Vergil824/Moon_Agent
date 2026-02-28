import { PropsWithChildren } from 'react';
import { useLaunch } from '@tarojs/taro';
import { initInterceptors } from '@core/api';

// NutUI styles are loaded on-demand via babel-plugin-import.
import '@nutui/nutui-react-taro/dist/style.css';


// Icons
import 'taro-icons/scss/MaterialIcons.scss'; // 112KB

import './app.css';

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.');

    // Initialize global request interceptors
    initInterceptors();
  });

  // children 是将要会渲染的页面
  return children;
}

export default App;
