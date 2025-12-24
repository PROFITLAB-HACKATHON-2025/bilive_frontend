import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';

import App from './App';
import { theme } from '@/styles/theme'; // 테마 설정 파일 경로 확인
import {GlobalStyle} from '@/styles/global'; // 전역 스타일 파일 경로 확인

// 1. QueryClient 인스턴스 생성
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // 실패 시 자동 재시도 끔 (개발 편의상)
            refetchOnWindowFocus: false, // 창 포커스 시 자동 새로고침 끔
        },
    },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        {/* 2. Provider로 앱 감싸기 */}
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <ThemeProvider theme={theme}>
                    <GlobalStyle />
                    <App />
                </ThemeProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </React.StrictMode>
);