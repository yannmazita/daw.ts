import daisyui from 'daisyui';

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
    },
    plugins: [
        daisyui,
    ],
}

