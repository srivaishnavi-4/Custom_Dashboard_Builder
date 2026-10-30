import {createRouter,createWebHistory } from 'vue-router'
import dashboard_list from '../views/dashboard_list.vue'
import orders_view from '../views/orders_view.vue'
import table from '../views/table.vue'
import configure_dashboard from '../views/configure_dashboard.vue'

const router=createRouter({
    history:createWebHistory(import.meta.env.BASE_URL),
    routes:[
        {
            path:'/',
            redirect:'/orders'
        },
        {
            path:'/dashboard',
            name:'Dashboards',
            component:dashboard_list
        },
        {
            path:'/orders',
            name:'Orders',
            component:orders_view
        },
        {
            path:'/table',
            name:'tables',
            component:table
        },
        {
            path:'/dashboard/configure',
            name:'configure page',
            component:configure_dashboard
        }
    ]
})

export default router