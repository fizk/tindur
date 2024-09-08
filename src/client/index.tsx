import React, {StrictMode} from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import ErrorPage from './pages/Error';

const router = createBrowserRouter([
    {
        path: "/",
        element: (<App />),
        errorElement: (<ErrorPage />),
        children: [
            // {
            //     path: "/styleguide",
            //     element: (
            //         <StyleGuidePage />
            //     ),
            //     errorElement: (<ErrorPage />),
            // },
            
        ]
    },
    {
        path: "*",
        element: (<pre>{JSON.stringify(window.location)}</pre>),
        errorElement: (<ErrorPage />),
    },
    ], {
        basename: '/tindur'
});


const queryClient = new QueryClient()

createRoot(document.querySelector('[data-react]'))
    .render(
        <StrictMode>
            <QueryClientProvider client={queryClient}>
                <RouterProvider router={router} />
            </QueryClientProvider>
        </StrictMode>
    );
