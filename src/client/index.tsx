import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ClientIdContextWrapper } from './contexts/ClientIdContext';
import App from './App';
import './fonts/futura/Futura-Light-Italic.woff';
import './fonts/futura/Futura-Bold-Italic.woff';
import './fonts/futura/Futura-Bold.woff';
import './fonts/futura/Futura-Book-Italic.woff';
import './fonts/futura/Futura-Book.woff';
import './fonts/futura/Futura-Light.woff';
import './fonts/futura/Futura-Medium-Italic.woff';
import './fonts/futura/Futura-Medium.woff';
import './images/tinds.jpg';
import './images/screenshot1.png';
import './images/screenshot2.png';
import './icons/512.png';
import './icons/192.png';
import './icons/32x32.png';
import './icons/16x16.png';

const queryClient = new QueryClient();

createRoot(document.querySelector('[data-react]'))
    .render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <ClientIdContextWrapper>
                    <App />
                </ClientIdContextWrapper>
            </QueryClientProvider>
        </StrictMode>
    );
