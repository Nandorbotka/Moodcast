export default {
    content: ["./index.html", "./main.js"],
    theme: {
        extend: {
            animation: {
                breathe: "breathe 4s ease-in-out infinite",
            },
            keyframes: {
                breathe: {
                    "0%, 100%": { transform: "scale(1)", opacity: "0.2" },
                    "50%": { transform: "scale(1.6)", opacity: "0.4" },
                },
            },
        },
    },
    plugins: [],
};
