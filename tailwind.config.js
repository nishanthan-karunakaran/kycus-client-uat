import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        primary: '#02327E',
        secondary: '#FF8754',
        secondaryLight: '#FF8754', // #FCAE91
        grayBg: '#F9FAFB',
        textBody: '#454F5E',
        textAccent: '#AEBDD2',
        textDark: '#050E1C',
        textSubtle: '#7B8798',
        failure: '#F42735',
        failureLight: '#FAD4D0',
        // success: '#219B17',
        success: '#3EB24E',
        successLight: '#90EE90',
        warning: '#F46127',
        warningLight: '#FDE68A',
        info: '#2A4BD0',
        infoLight: '#BFDBFE',
        danger: '#F42735',
        dangerLight: '#FCA5A5',
        error: '#F42735',
        errorLight: '#FCA5A5',
        secondaryBlue: '#4076C9',
        formTextPrimary: '#4B4B4D',
        formTextSecondary: '#262900',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      animation: {
        'slow-spin': 'slow-spin 3s linear infinite',
      },
      keyframes: {
        'slow-spin': {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },
    },
  },
  plugins: [forms, typography],
};
