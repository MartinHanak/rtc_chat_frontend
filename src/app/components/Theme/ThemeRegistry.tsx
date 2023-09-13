"use client";

import { createTheme, ThemeOptions, ThemeProvider } from "@mui/material";
import NextAppDirEmotionCacheProvider from "./EmotionCache";
import CssBaseline from "@mui/material/CssBaseline";
import React from "react";
import { Roboto } from 'next/font/google';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const themeOptions: ThemeOptions = {
    palette: {
        mode: 'light',
    },
    typography: {
        fontFamily: roboto.style.fontFamily,
    },
    components: {
        MuiAlert: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    ...(ownerState.severity === 'info' && {
                        backgroundColor: '#60a5fa',
                    }),
                }),
            },
        },
    },
};

const theme = createTheme(themeOptions);

export default function ThemeRegistry({ children }: { children: React.ReactNode; }) {
    return (
        <NextAppDirEmotionCacheProvider options={{ key: "mui" }} >
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </NextAppDirEmotionCacheProvider>
    );
}