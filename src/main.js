import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/reset.css'
import './styles/variables.css'
import './styles/global.css'

// Keep app bootstrap small: global CSS is loaded before mounting so every route
// receives the same reset, tokens, and shared layout rules.
createApp(App).use(router).mount('#app')
