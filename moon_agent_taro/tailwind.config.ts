import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ===========================================
        // Moon Brand Colors (aligned with moon-agent)
        // ===========================================
        'moon-primary': '#8B5CF6',
        'moon-primary-hover': '#7C3AED',
        'moon-purple': '#8B5CF6', // Alias for moon-primary
        'moon-purple-hover': '#7C3AED', // Alias for moon-primary-hover
        'brand-purple': '#8B5CF6', // Alias for moon-primary
        'moon-secondary': '#EC4899',
        'moon-pink': '#EC4899', // Alias for moon-secondary
        'moon-text': '#1F2937',
        'moon-text-muted': '#6B7280',
        'moon-destructive': '#D4183D',
        'moon-page-from': '#FFF5F7',
        'moon-page-to': '#FAF5FF',

        // ===========================================
        // Semantic Colors (aligned with moon-agent)
        // Note: Using hex values instead of hsl(var(--xxx)) for mini program compatibility
        // ===========================================
        primary: {
          DEFAULT: '#8B5CF6',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#EC4899',
          foreground: '#FFFFFF',
        },
        destructive: {
          DEFAULT: '#D4183D',
          foreground: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#F3F4F6',
          foreground: '#6B7280',
        },
        accent: {
          DEFAULT: '#F3F4F6',
          foreground: '#1F2937',
        },
        background: '#FFFFFF',
        foreground: '#1F2937',
        border: '#E5E7EB',
        input: '#E5E7EB',
        ring: '#8B5CF6',
        card: {
          DEFAULT: '#FFFFFF',
          foreground: '#1F2937',
        },
        // Gradient colors (aligned with moon-agent)
        gradient: {
          start: '#7C3AED',
          end: '#A855F7',
        },
      },
      borderRadius: {
        // Using fixed values instead of var(--radius) for mini program compatibility
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
      },
      backgroundImage: {
        'page-gradient': 'linear-gradient(to bottom, #FFF5F7, #FAF5FF)',
        'violet-gradient': 'linear-gradient(135deg, #7C3AED, #A855F7)',
      },
      boxShadow: {
        header: '0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
        nav: '0px -4px 6px -1px rgba(0, 0, 0, 0.05)',
        card: '0 10px 40px rgba(0, 0, 0, 0.08)',
        glass: '0 10px 40px rgba(0, 0, 0, 0.08)',
      },
      // ===========================================
      // Animations (mini program compatible)
      // ===========================================
      keyframes: {
        // Fade animations
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        // Slide animations
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-down': {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        'slide-in-left': {
          from: { opacity: '0', transform: 'translateX(-20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        // Scale animations
        'scale-in': {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        'scale-out': {
          from: { opacity: '1', transform: 'scale(1)' },
          to: { opacity: '0', transform: 'scale(0.95)' },
        },
        // Bounce animation
        'bounce-in': {
          '0%': { opacity: '0', transform: 'scale(0.3)' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        // Pulse animation (already in Tailwind default, but explicit for mini program)
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        // Spin animation
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        // Shake animation
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
      },
      animation: {
        // Fade
        'fade-in': 'fade-in 0.3s ease-out',
        'fade-out': 'fade-out 0.3s ease-out',
        // Slide
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'slide-in-left': 'slide-in-left 0.3s ease-out',
        // Scale
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-out',
        // Bounce
        'bounce-in': 'bounce-in 0.5s ease-out',
        // Pulse
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        // Spin
        'spin-slow': 'spin 3s linear infinite',
        // Shake
        shake: 'shake 0.5s ease-in-out',
      },
    },
  },
  corePlugins: {
    // Disable preflight for mini program compatibility
    // Enable for H5 via environment variable if needed
    preflight: process.env.TARO_ENV === 'h5',
    container: false,
  },
  plugins: [],
};

export default config;
