import { defineConfig } from 'vite';
import externals from "rollup-plugin-node-externals";

export default defineConfig({
    build: {
        lib: {
            entry: "./src/index.ts",
            formats: [ "es", "cjs" ],
            fileName: "run",
        },
        target: "node22",
    },
    plugins: [
        externals({
            deps: false,
            builtins: true,
        }),
    ]
});