import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// base './' keeps every asset path relative, so the build works from any GitHub Pages sub-path
export default defineConfig({base:'./',plugins:[react()]})
