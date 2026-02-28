/**
 * ProfileHeader - Displays user avatar, nickname and ID
 * Migrated from moon-agent/components/profile/ProfileHeader.tsx
 *
 * Features:
 * - User avatar with gradient border
 * - Default avatar icon when no avatar
 * - Nickname and user ID display
 */

import { View, Text, Image } from '@tarojs/components';
import { MaterialIcons } from 'taro-icons';
import type { AppMemberUserInfoRespVO } from '@core/user';

interface ProfileHeaderProps {
  user: AppMemberUserInfoRespVO;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <View className='px-4 pt-6 pb-4'>
      {/* White card with centered content */}
      <View className='bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm px-6 py-8 flex flex-col items-center'>
        {/* Avatar with gradient border */}
        <View className='relative mb-4'>
          {user.avatar ? (
            <View className='relative w-24 h-24 rounded-full overflow-hidden border-[3px] border-transparent bg-gradient-to-br from-[#c084fc] via-[#e879f9] to-[#f472b6] p-[3px]'>
              <View className='w-full h-full rounded-full overflow-hidden bg-white'>
                <Image
                  src={user.avatar}
                  mode='aspectFill'
                  className='w-full h-full'
                />
              </View>
            </View>
          ) : (
            <View className='relative w-24 h-24 rounded-full bg-gradient-to-br from-[#c084fc] via-[#e879f9] to-[#f472b6] p-[3px]'>
              <View className='w-full h-full rounded-full bg-[#fdf4ff] flex items-center justify-center'>
                <MaterialIcons name='person' size={40} color='#c084fc' />
              </View>
            </View>
          )}
        </View>

        {/* User Info - centered */}
        <Text className='text-lg font-semibold text-gray-900 text-center'>
          {user.nickname || '用户'}
        </Text>
        <Text className='text-sm text-gray-400 mt-1 text-center'>
          ID: {user.id}
        </Text>
      </View>
    </View>
  );
}
