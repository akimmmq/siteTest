import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import constants from '../scripts/ahmadshah-tickets-ext-constants.js'

const paymentApp = createApp({
    data() {
        return {
            test: 'Hello from dynamically updated shit!'
        }
    },

    computed: {
        isDebug() {
            return constants.isDebug
        }
    }
})

paymentApp.mount('#at_ext-payment-app')