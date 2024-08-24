import daisyui from 'daisyui';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'ts-blue': '#5bcefa',
                'ts-pink': '#f5a9b8',
            },
            translate: {
                'half-negative': '-50%',
            },
        },
        screens: {
            'xs': '430px',
            ...defaultTheme.screens,
        }
    },
    plugins: [
        daisyui,
    ],
}

