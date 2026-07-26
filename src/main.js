import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import './styles/reset.css'
import './styles/variables.css'
import './styles/global.css'

// The router changes only the portfolio state; the application shell remains mounted.
createApp(App).use(router).mount('#app')
