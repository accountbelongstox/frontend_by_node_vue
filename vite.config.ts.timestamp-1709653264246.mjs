// vite.config.ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import vueI18n from "@intlify/vite-plugin-vue-i18n";
var __vite_injected_original_dirname = "D:\\programing\\desktop_by_node\\frontend_desktop_by_node_vue";
var vite_config_default = defineConfig({
  plugins: [
    vue(),
    vueI18n({
      include: path.resolve(__vite_injected_original_dirname, "./src/locales/**")
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    dedupe: [
      "vue"
    ],
    preserveSymlinks: false
  },
  optimizeDeps: {
    include: ["quill"]
  },
  build: {
    lib: {
      entry: path.resolve(__vite_injected_original_dirname, "./src/components/main.js"),
      name: "LuiVue",
      fileName: (format) => `lui-vue.${format}.js`
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: {
          vue: "Vue"
        }
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxwcm9ncmFtaW5nXFxcXGRlc2t0b3BfYnlfbm9kZVxcXFxmcm9udGVuZF9kZXNrdG9wX2J5X25vZGVfdnVlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxwcm9ncmFtaW5nXFxcXGRlc2t0b3BfYnlfbm9kZVxcXFxmcm9udGVuZF9kZXNrdG9wX2J5X25vZGVfdnVlXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9wcm9ncmFtaW5nL2Rlc2t0b3BfYnlfbm9kZS9mcm9udGVuZF9kZXNrdG9wX2J5X25vZGVfdnVlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcbmltcG9ydCB2dWVJMThuIGZyb20gJ0BpbnRsaWZ5L3ZpdGUtcGx1Z2luLXZ1ZS1pMThuJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICAgIHZ1ZSgpLFxuICAgICAgICB2dWVJMThuKHtcbiAgICAgICAgICAgIGluY2x1ZGU6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9sb2NhbGVzLyoqJyksXG4gICAgICAgIH0pLFxuICAgIF0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgICBhbGlhczoge1xuICAgICAgICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICAgfSxcbiAgICAgICAgZGVkdXBlOiBbXG4gICAgICAgICAgICAndnVlJ1xuICAgICAgICBdLFxuICAgICAgICBwcmVzZXJ2ZVN5bWxpbmtzOiBmYWxzZVxuICAgIH0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICAgIGluY2x1ZGU6IFsncXVpbGwnXSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICAgIGxpYjoge1xuICAgICAgICAgICAgZW50cnk6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9jb21wb25lbnRzL21haW4uanMnKSxcbiAgICAgICAgICAgIG5hbWU6ICdMdWlWdWUnLFxuICAgICAgICAgICAgZmlsZU5hbWU6IChmb3JtYXQpID0+IGBsdWktdnVlLiR7Zm9ybWF0fS5qc2BcbiAgICAgICAgfSxcbiAgICAgICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgICAgICAgZXh0ZXJuYWw6IFsndnVlJ10sXG4gICAgICAgICAgICBvdXRwdXQ6IHtcbiAgICAgICAgICAgICAgICBnbG9iYWxzOiB7XG4gICAgICAgICAgICAgICAgICAgIHZ1ZTogJ1Z1ZSdcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXdXLFNBQVMsb0JBQW9CO0FBQ3JZLE9BQU8sU0FBUztBQUNoQixPQUFPLFVBQVU7QUFDakIsT0FBTyxhQUFhO0FBSHBCLElBQU0sbUNBQW1DO0FBS3pDLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQ3hCLFNBQVM7QUFBQSxJQUNMLElBQUk7QUFBQSxJQUNKLFFBQVE7QUFBQSxNQUNKLFNBQVMsS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLElBQ3ZELENBQUM7QUFBQSxFQUNMO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDTCxPQUFPO0FBQUEsTUFDSCxLQUFLLEtBQUssUUFBUSxrQ0FBVyxPQUFPO0FBQUEsSUFDeEM7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNKO0FBQUEsSUFDSjtBQUFBLElBQ0Esa0JBQWtCO0FBQUEsRUFDdEI7QUFBQSxFQUNBLGNBQWM7QUFBQSxJQUNWLFNBQVMsQ0FBQyxPQUFPO0FBQUEsRUFDckI7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNILEtBQUs7QUFBQSxNQUNELE9BQU8sS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQ3pELE1BQU07QUFBQSxNQUNOLFVBQVUsQ0FBQyxXQUFXLFdBQVc7QUFBQSxJQUNyQztBQUFBLElBQ0EsZUFBZTtBQUFBLE1BQ1gsVUFBVSxDQUFDLEtBQUs7QUFBQSxNQUNoQixRQUFRO0FBQUEsUUFDSixTQUFTO0FBQUEsVUFDTCxLQUFLO0FBQUEsUUFDVDtBQUFBLE1BQ0o7QUFBQSxJQUNKO0FBQUEsRUFDSjtBQUNKLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
