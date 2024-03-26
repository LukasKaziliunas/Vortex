import vue from '@vitejs/plugin-vue'

export default {
    root: 'src/',
    publicDir: 'public',
    base: './',
    server: {
        proxy: {
          '/socket.io': {
            target: 'http://localhost:3000',
            changeOrigin: true,
            ws: true,
          },
          '/getLobbies': 'http://localhost:3000',
          '/createLobby': 'http://localhost:3000',
          '/deleteLobby': 'http://localhost:3000',
        }
      },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    plugins: [vue()],
    assetsInclude: ['**/*.glb'],
}