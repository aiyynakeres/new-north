import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, ".", "");
	return {
		server: {
			port: 3000,
			host: "0.0.0.0",
			proxy: {
				"/api": {
					target: env.VITE_API_PROXY_TARGET || "http://localhost:8080",
					changeOrigin: true,
				},
			},
		},
		plugins: [react()],
		resolve: {
			alias: {
				"@": path.resolve(__dirname, "."),
			},
		},
	};
});
