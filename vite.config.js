import vue from '@vitejs/plugin-vue'

export default {
    root: 'src/',
    publicDir: 'public',
    base: './',
    envDir: "../",
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    plugins: [vue()],
    assetsInclude: ['**/*.glb'],
}