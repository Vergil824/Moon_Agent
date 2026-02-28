/**
 * SendCodeButton - Isolated component for sending SMS verification code
 *
 * This component manages its own countdown state to prevent parent re-renders
 * from affecting sibling components like Input fields.
 *
 * Key design decisions:
 * 1. Countdown state is internal to this component
 * 2. Uses memo with custom comparison to prevent unnecessary re-renders
 * 3. Callbacks are stored in refs to maintain stability
 */
import { memo, useState, useEffect, useRef, useCallback } from 'react';
import { Button, Text } from '@tarojs/components';

// Default countdown duration in seconds
const DEFAULT_COUNTDOWN_DURATION = 60;

interface SendCodeButtonProps {
  /** Callback when button is clicked - should return true if code was sent successfully */
  onSend: () => Promise<boolean>;
  /** Countdown duration in seconds (default: 60) */
  countdownDuration?: number;
  /** Custom class name */
  className?: string;
  /** Text class name */
  textClassName?: string;
  /** Idle text (default: '获取验证码') */
  idleText?: string;
  /** Sending text (default: '发送中...') */
  sendingText?: string;
}

function SendCodeButtonInner({
  onSend,
  countdownDuration = DEFAULT_COUNTDOWN_DURATION,
  className = '',
  textClassName = '',
  idleText = '获取验证码',
  sendingText = '发送中...',
}: SendCodeButtonProps) {
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Store onSend in ref to prevent re-renders when callback changes
  const onSendRef = useRef(onSend);
  onSendRef.current = onSend;

  // Countdown timer effect
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // Button is disabled during countdown or while sending
  const isButtonBusy = countdown > 0 || isSending;

  // Get button text based on state
  const getButtonText = () => {
    if (isSending) return sendingText;
    if (countdown > 0) return `${countdown}s`;
    return idleText;
  };

  // Handle button click
  const handleClick = useCallback(async () => {
    if (isButtonBusy) return;

    try {
      setIsSending(true);
      const success = await onSendRef.current();
      if (success) {
        setCountdown(countdownDuration);
      }
    } finally {
      setIsSending(false);
    }
  }, [isButtonBusy, countdownDuration]);

  return (
    <Button
      className={`${className} ${isButtonBusy ? 'opacity-60' : ''}`}
      disabled={isButtonBusy}
      onClick={handleClick}
    >
      <Text className={`${textClassName} ${isButtonBusy ? 'text-[#9ca3af]' : ''}`}>
        {getButtonText()}
      </Text>
    </Button>
  );
}

// Custom comparison - only re-render if visual props change
function arePropsEqual(
  prevProps: SendCodeButtonProps,
  nextProps: SendCodeButtonProps
): boolean {
  return (
    prevProps.countdownDuration === nextProps.countdownDuration &&
    prevProps.className === nextProps.className &&
    prevProps.textClassName === nextProps.textClassName &&
    prevProps.idleText === nextProps.idleText &&
    prevProps.sendingText === nextProps.sendingText
  );
}

export const SendCodeButton = memo(SendCodeButtonInner, arePropsEqual);

export default SendCodeButton;
