import { createRouter, createWebHashHistory } from "vue-router";

import Home from '../Home.vue'
import LobbySelection from '../LobbySelection.vue'
import Settings from '../Settings.vue'
import Controls from '../Controls.vue'
import JoinLobby from '../JoinLobby.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/Controls',
        name: 'Controls',
        component: Controls
    },
    {
        path: '/Settings',
        name: 'Settings',
        component: Settings
    },
    {
        path: '/Lobbies',
        name: 'Lobbies',
        component: LobbySelection
    },
    {
        path: '/JoinLobby/:lobbyName',
        name: 'JoinLobby',
        component: JoinLobby,
        props: true
    }
]

const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

export default router;