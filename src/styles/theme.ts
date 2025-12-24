export const theme = {
    colors: {
        bg: "#EEF1F4",
        white: "#FFFFFF",
        text: "#111827",
        subText: "#6B7280",
        primary: "#6D5EF8",
        border: "#E5E7EB",
        chip: "#F3F4F6",
    },
} as const;

export type ThemeType = typeof theme;