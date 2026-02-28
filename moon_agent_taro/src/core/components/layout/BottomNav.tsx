import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MaterialIcons } from 'taro-icons';

type NavTab = 'chat' | 'cart' | 'profile';

interface NavItem {
  id: NavTab;
  path: string;
  iconName: string;
}

const navItems: NavItem[] = [
  {
    id: 'chat',
    path: '/pages/chat/index',
    iconName: 'chat-bubble-outline',
  },
  {
    id: 'cart',
    path: '/pages/cart/index',
    iconName: 'shopping-cart',
  },
  {
    id: 'profile',
    path: '/pages/profile/index',
    iconName: 'person-outline',
  },
];

interface BottomNavProps {
  activeTab?: NavTab;
  /** Cart item count to display as badge */
  cartCount?: number;
}

/**
 * BottomNav - Custom bottom navigation bar
 * Matches moon-agent BottomNav component:
 * - Rounded top corners (15px)
 * - Top shadow
 * - Three icon buttons: Message, Cart, Profile
 * - Active item: purple icon with light purple background
 * - Cart icon shows badge with item count
 */
export function BottomNav({ activeTab = 'chat', cartCount = 0 }: BottomNavProps) {
  const handleNavClick = (item: NavItem) => {
    if (item.id === activeTab) return;

    // Use switchTab for tabBar pages
    Taro.switchTab({
      url: item.path,
    });
  };

  // Format badge count (99+ for large numbers)
  const formatBadgeCount = (count: number): string => {
    if (count > 99) return '99+';
    return String(count);
  };

  return (
    <View className='fixed left-0 right-0 bottom-0 z-50 bg-white border-t border-[#e5e7eb] rounded-t-[15px] pt-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_rgba(0,0,0,0.05)]'>
      <View className='flex h-12 items-center justify-between px-6'>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const showBadge = item.id === 'cart' && cartCount > 0;

          return (
            <View
              key={item.id}
              className='flex w-16 items-center justify-center active:opacity-70'
              onClick={() => handleNavClick(item)}
            >
              <View
                className={`relative flex items-center justify-center w-9 h-9 rounded-[14px] transition-colors duration-150 ${
                  isActive ? 'bg-[#faf5ff]' : ''
                }`}
              >
                <MaterialIcons
                  name={item.iconName}
                  size={24}
                  color={isActive ? '#8b5cf6' : '#6b7280'}
                />
                {/* Cart Badge - Larger size, closer to icon */}
                {showBadge && (
                  <View className='absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 min-w-[30px] h-[30px] px-1 rounded-full bg-gradient-moon-primary flex items-center justify-center shadow-md'>
                    <Text className='text-[20px] font-bold text-white leading-none'>
                      {formatBadgeCount(cartCount)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}
