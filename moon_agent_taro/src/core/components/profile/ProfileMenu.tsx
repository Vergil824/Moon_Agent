/**
 * ProfileMenu - Navigation menu items for profile page
 * Migrated from moon-agent/components/profile/ProfileMenu.tsx
 *
 * Features:
 * - Two groups of menu items
 * - Icons with labels
 * - Navigation to sub-pages
 * - Disabled state for unavailable features
 * - Logout button
 */

import { View, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { MaterialIcons } from 'taro-icons';
import { useLogout } from '@core/user';

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  disabled?: boolean;
}

// First group: Orders, After-sale, Addresses
const primaryMenuItems: MenuItem[] = [
  {
    id: 'orders',
    label: '我的订单',
    path: '/pages/profile/orders/index',
    icon: 'shopping_bag',
  },
  {
    id: 'aftersale',
    label: '我的售后',
    path: '/pages/profile/aftersale/index',
    icon: 'refresh',
    disabled: true, // Temporarily disabled
  },
  {
    id: 'addresses',
    label: '收货地址',
    path: '/pages/profile/addresses/index',
    icon: 'place',
  },
];

// Second group: Edit Profile, About
const secondaryMenuItems: MenuItem[] = [
  {
    id: 'edit-profile',
    label: '修改个人信息',
    path: '/pages/profile/settings/edit-profile/index',
    icon: 'person',
  },
  {
    id: 'about',
    label: '关于我们',
    path: '/pages/profile/about/index',
    icon: 'info',
    disabled: true, // Temporarily disabled
  },
];

interface MenuItemRowProps {
  item: MenuItem;
  isLast: boolean;
}

function MenuItemRow({ item, isLast }: MenuItemRowProps) {
  const handleClick = () => {
    if (!item.disabled) {
      Taro.navigateTo({ url: item.path });
    }
  };

  return (
    <>
      <View
        className={`flex items-center justify-between py-4 px-4 ${
          item.disabled ? 'opacity-50' : 'active:bg-gray-50/50'
        }`}
        onClick={handleClick}
      >
        <View className='flex items-center gap-3'>
          <MaterialIcons
            name={item.icon as any}
            size={20}
            color={item.disabled ? '#9ca3af' : '#8b5cf6'}
          />
          <Text className='text-base text-gray-800'>{item.label}</Text>
        </View>
        <MaterialIcons name='chevron_right' size={20} color='#d1d5db' />
      </View>
      {!isLast && <View className='h-px bg-gray-100 mx-4' />}
    </>
  );
}

export default function ProfileMenu() {
  const logoutMutation = useLogout();

  // Handle logout
  const handleLogout = () => {
    Taro.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmText: '退出',
      confirmColor: '#ef4444',
      success: (res) => {
        if (res.confirm) {
          logoutMutation.mutate();
        }
      },
    });
  };

  return (
    <View className='px-4'>
      {/* Primary menu group */}
      <View className='bg-white rounded-2xl overflow-hidden shadow-sm'>
        {primaryMenuItems.map((item, index) => (
          <MenuItemRow
            key={item.id}
            item={item}
            isLast={index === primaryMenuItems.length - 1}
          />
        ))}
      </View>

      {/* Secondary menu group */}
      <View className='bg-white rounded-2xl overflow-hidden shadow-sm mt-4'>
        {secondaryMenuItems.map((item, index) => (
          <MenuItemRow
            key={item.id}
            item={item}
            isLast={index === secondaryMenuItems.length - 1}
          />
        ))}
      </View>

      {/* Logout button */}
      <View
        className={`bg-white rounded-2xl px-4 py-4 shadow-sm active:bg-red-50 mt-4 ${
          logoutMutation.isPending ? 'opacity-50' : ''
        }`}
        onClick={!logoutMutation.isPending ? handleLogout : undefined}
      >
        <View className='flex items-center justify-center gap-2'>
          <MaterialIcons name='exit_to_app' size={20} color='#ef4444' />
          <Text className='text-base text-red-500'>
            {logoutMutation.isPending ? '退出中...' : '退出登录'}
          </Text>
        </View>
      </View>
    </View>
  );
}
