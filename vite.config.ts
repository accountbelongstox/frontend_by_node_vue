import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import vueI18n from '@intlify/vite-plugin-vue-i18n';

export default defineConfig({
    plugins: [
        vue(),
        vueI18n({
            include: path.resolve(__dirname, './src/locales/**'),
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
        dedupe: [
            'vue'
        ],
        preserveSymlinks: false
    },
    optimizeDeps: {
        include: ['quill'],
    },
    build: {
        lib: {
            entry: path.resolve(__dirname, './src/components/main.js'),
            name: 'LuiVue',
            fileName: (format) => `lui-vue.${format}.js`
        },
        rollupOptions: {
            external: ['vue'],
            output: {
                globals: {
                    vue: 'Vue'
                },
            },
        },
    },
});
