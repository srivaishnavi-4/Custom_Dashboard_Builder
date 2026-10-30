import { createApp } from 'vue'
import App from './App.vue'
import * as halleyxComponents from 'halleyx-ui-framework'
// halleyxComponents.for
// console.log(halleyxComponents)
import 'halleyx-ui-framework/dist/es/index.css'
import './style.css'

const app = createApp(App)

Object.entries(halleyxComponents).forEach(([name,component])=>{
        app.component(name,component)
})
import router from './router'

// app.use(halleyxComponents)
app.use(router)
app.mount('#app')

 

// import { createApp } from 'vue'
// import App from "./App.vue";
// import halleyxKit from 'halleyx-ui-framework'
// //load the styles
// import 'halleyx-ui-framework/dist/es/index.css';
// import router from './router'
// import './style.css'

// const app=createApp(App)

// app.use(router)
// app.use(halleyxKit).mount("#app");