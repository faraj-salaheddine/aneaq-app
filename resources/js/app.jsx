import './bootstrap';
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'ANEAQ';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,

    resolve: async (name) => {
        const pages = import.meta.glob('./Pages/**/*.jsx');

        const page = pages[`./Pages/${name}.jsx`];

        if (!page) {
            throw new Error(`Page Inertia introuvable: ./Pages/${name}.jsx`);
        }

        return page();
    },

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },

    progress: {
        color: '#2563eb',
    },
});