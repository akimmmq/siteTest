import { createApp } from '../scripts/vue-dev.js'
import constants from '../scripts/ahmadshah-tickets-ext-constants.js'
import Ticket from '../scripts/ticket.js'
import Passenger from '../scripts/passenger.js'

const profileExtensionApp = createApp({
    data() {
        return {
            test: 'Hi!',

            userTickets: [],

            showAdditionalInfo: {},
            showTicketIcon: true
        }
    },

    computed: {
        isDebug() {
            return constants.isDebug
        }
    },

    methods: {
        async fetchUserTickets() {
            let tickets = []
            let showAdditionalInfo = {}

            if (constants.isDebug) {
                tickets = [
                    Ticket.randomTestData,
                    Ticket.randomTestData
                ]

                tickets[0].passengersList.push(Passenger.randomTestData)
                tickets[1].passengersList.push(Passenger.randomTestData)
                tickets[1].passengersList.push(Passenger.randomTestData)
            }

            tickets.forEach(ticket => showAdditionalInfo[ticket.id] = false)

            this.userTickets = tickets
            this.showAdditionalInfo = showAdditionalInfo
        },

        pay() {
            window.location.assign('/payment-page/')
        },

        toggleAdditionalInfo(ticket) {
            console.log(this.showAdditionalInfo)
            this.showAdditionalInfo[ticket.id] = !this.showAdditionalInfo[ticket.id]
            console.log(this.showAdditionalInfo)
        },

        updateRenderParams() {
            this.showTicketIcon = window.innerWidth >= 576
        }
    },

    mounted() {
        this.fetchUserTickets()
        this.updateRenderParams()

        window.addEventListener('resize', this.updateRenderParams)
    },

    unmounted() {
        window.removeEventListener('resize', this.updateRenderParams)
    }
})

profileExtensionApp.mount('#profile-extension-app')