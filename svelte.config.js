import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'path'; // Import path module

/** @type {import('@sveltejs/kit').Config} */
export default {
    kit: {
        adapter: adapter()
    }

};