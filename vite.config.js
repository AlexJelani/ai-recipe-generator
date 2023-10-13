import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import replace from '@rollup/plugin-replace'; // Make sure to install this plugin

dotenv.config();

export default defineConfig({
	// Your VITE configuration settings here

	// Change the output format to ESM
	build: {
		rollupOptions: {
			output: {
				format: 'esm', // Set the format to 'esm'
			},
			plugins: [
				replace({
					'process.env': JSON.stringify(import.meta.env),
					preventAssignment: true, // Set preventAssignment to true

				}),
			],
		},
	},
});


