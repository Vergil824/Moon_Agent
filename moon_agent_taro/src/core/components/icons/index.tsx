import { View } from '@tarojs/components';

/**
 * Icon component props
 */
interface IconProps {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

/**
 * MessageCircleIcon - Chat/message icon
 */
export function MessageCircleIcon({
  size = 24,
  color = '#6b7280',
  fill = 'none',
  strokeWidth = 2,
}: IconProps) {
  return (
    <View
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z' />
      </svg>
    </View>
  );
}

/**
 * ShoppingCartIcon - Shopping cart icon
 */
export function ShoppingCartIcon({
  size = 24,
  color = '#6b7280',
  fill = 'none',
  strokeWidth = 2,
}: IconProps) {
  return (
    <View
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <circle cx='9' cy='21' r='1' />
        <circle cx='20' cy='21' r='1' />
        <path d='M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6' />
      </svg>
    </View>
  );
}

/**
 * UserIcon - User/profile icon
 */
export function UserIcon({
  size = 24,
  color = '#6b7280',
  fill = 'none',
  strokeWidth = 2,
}: IconProps) {
  return (
    <View
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox='0 0 24 24'
        fill={fill}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' />
        <circle cx='12' cy='7' r='4' />
      </svg>
    </View>
  );
}
