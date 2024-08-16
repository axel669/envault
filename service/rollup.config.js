import fileRoutes from "@axel669/rollup-hono-files"
import resolve from "@rollup/plugin-node-resolve"

export default {
    input: "service/src/main.js",
    output: {
        file: "service/build/main.js",
        format: "esm"
    },
    plugins: [
        fileRoutes,
        resolve(),
    ]
}
