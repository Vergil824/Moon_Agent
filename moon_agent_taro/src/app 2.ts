import { PropsWithChildren, useState } from 'react';
import { useLaunch } from '@tarojs/taro';
import { initInterceptors } from '@core/api';
import { QueryClientProvider, createQueryClient } from '@core/query';

// NutUI styles - Required for components to render correctly
// Note: babel-plugin-import's style:'css' does not work with Taro Vite
import '@nutui/nutui-react-taro/dist/style.css';

// Icons
import 'taro-icons/scss/MaterialCommunityIcons.scss'; // 495KB
import 'taro-icons/scss/MaterialIcons.scss'; // 112KB
import 'taro-icons/scss/Ionicons.scss'; // 134KB
import 'taro-icons/scss/FontAwesome.scss'; // 322KB

import './app.css';

function App({ children }: PropsWithChildren) {
  // Create QueryClient once using useState to ensure it persists across re-renders
  const [queryClient] = useState(() => createQueryClient());

  useLaunch(() => {
    console.log('App launched.');

    // Initialize global request interceptors
    initInterceptors();
  });

  // Wrap children with QueryClientProvider for TanStack Query support
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default App;
