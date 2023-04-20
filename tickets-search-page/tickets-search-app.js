import { createApp } from '../scripts/vue-dev.js'
import constants from '../scripts/ahmadshah-tickets-ext-constants.js'
import Ticket from '../scripts/ticket.js'

const SortingType = {
    recommendedFirst:        'recommendedFirst',
    cheapestFirst:           'cheapestFirst',
    departureDateEarlyFirst: 'departureDateEarlyFirst',
    arrivalDateEarlyFirst:   'arrivalDateEarlyFirst',
    durationShorterFirst:    'durationShorterFirst',
    popularFirst:            'popularFirst',
}

const SortingTypeDisplayName = {
    recommendedFirst:        'Сначала рекомендуемые',
    cheapestFirst:           'Сначала дешёвые',
    departureDateEarlyFirst: 'Время вылета',
    arrivalDateEarlyFirst:   'Время прибытия',
    durationShorterFirst:    'Длительность поездки',
    popularFirst:            'Популярность',
}

const SortingTypeComparatorFunction = {
    // ??? //
    recommendedFirst:        (a, b) => 0,
    // === //

    cheapestFirst:           (a, b) => a.price - b.price,
    departureDateEarlyFirst: (a, b) => a.departureAt - b.departureAt,
    arrivalDateEarlyFirst:   (a, b) => a.arrivalAt - b.arrivalAt,
    durationShorterFirst:    (a, b) => a.duration - b.duration,

    // ??? //
    popularFirst:            (a, b) => 0
    // === //
}

class Direction {
    constructor(title, imageUrl) {
        this.title = title
        this.imageUrl = imageUrl
    }
}

const ticketsSearchApp = createApp({
    data() {
        return {
            ticketsSearchParams: {
                from: '',
                to: '',
                departureAt: null,
                returnAt: null,
                passengersAmount: 1
            },

            showCalendar: false,
            showPassengerAmountControls: false,

            suggestedDirections: [],

            dataIsReady: false,
            ticketsSearchResultsUnsorted: {},

            SortingType: SortingTypeDisplayName, // enum prototype
            selectedSortingType: SortingType.recommendedFirst,

            minPrice: Infinity,
            maxPrice: 0,
            minDuration: Infinity,
            maxDuration: 0,

            cheapestTicketID: null,
            fastestTicketID: null,

            priceFilter: 0,
            durationFilter: 0,

            stickFiltersOnDesktop: false,
            showFiltersButtonVisible: false
        }
    },

    computed: {
        isDebug() {
            return constants.isDebug
        },

        passengersEnding() {
            if (   this.ticketsSearchParams.passengersAmount > 10
                && this.ticketsSearchParams.passengersAmount < 20   )
                return 'ов';

            switch (this.ticketsSearchParams.passengersAmount % 10) {
                case 2: case 3: case 4:
                    return 'а';
                case 5: case 6: case 7: case 8: case 9: case 0:
                    return 'ов';
                default:
                    return '';
            }
        },

        departureDateStr() {
            if (this.ticketsSearchParams.departureAt == null)
                return ''

            return this.ticketsSearchParams.departureAt
                .toLocaleDateString('ru-ru', constants.dateStringOptions)
        },

        returnDateStr() {
            if (this.ticketsSearchParams.returnAt == null)
                return ''

            return this.ticketsSearchParams.returnAt
                .toLocaleDateString('ru-ru', constants.dateStringOptions)
        },

        filteredSortedTickets() {
            if (constants.isDebug)
                console.log("Refiltering...", this.selectedSortingType)

            // 1st step: filter
            let filteredTicketsIDs = Object.keys(this.ticketsSearchResultsUnsorted).filter(
                id => {
                    const ticket = this.ticketsSearchResultsUnsorted[id]
                    console.log(ticket.duration / 60, this.durationFilter)
                    return ticket.price <= this.priceFilter && ticket.duration / 60 <= this.durationFilter
                }
            )

            if (!filteredTicketsIDs.length)
                return new Map()

            const sortingFunction = SortingTypeComparatorFunction[this.selectedSortingType]

            // 2nd step: sort filtered
            filteredTicketsIDs.sort( (aID, bID) =>
                sortingFunction(
                    this.ticketsSearchResultsUnsorted[aID],
                    this.ticketsSearchResultsUnsorted[bID],
                )
            )

            // 3rd step: get the cheapest and the fastest tickets if the sorting type selected
            // is "recommendedFirst"
            let cheapestTicket = this.ticketsSearchResultsUnsorted[filteredTicketsIDs[0]]
            let fastestTicket = this.ticketsSearchResultsUnsorted[filteredTicketsIDs[0]]

            if (this.selectedSortingType === SortingType.recommendedFirst && filteredTicketsIDs.length > 1) {
                filteredTicketsIDs.forEach(id => {
                    const currentTicket = this.ticketsSearchResultsUnsorted[id]

                    if (currentTicket.price < cheapestTicket.price)
                        cheapestTicket = currentTicket

                    if (currentTicket.duration < fastestTicket.duration)
                        fastestTicket = currentTicket
                })

                this.cheapestTicketID = cheapestTicket.id
                this.fastestTicketID = fastestTicket.id
            } else {
                this.cheapestTicketID = null
                this.fastestTicketID = null
            }

            // 4th step: make a Map of that thing to ensure tickets being
            // displayed in insertion order
            let ticketsToDisplay = new Map()

            if (this.selectedSortingType === SortingType.recommendedFirst) {
                ticketsToDisplay.set(cheapestTicket.id, cheapestTicket)
                ticketsToDisplay.set(fastestTicket.id, fastestTicket)
            }

            filteredTicketsIDs.forEach(
                id => ticketsToDisplay.set(id, this.ticketsSearchResultsUnsorted[id])
            )

            console.log(ticketsToDisplay.entries())

            return ticketsToDisplay
        }
    },

    methods: {
        async fetchSuggestedDirections() {
            this.suggestedDirections = []

            if (this.isDebug) {
                this.suggestedDirections = [
                    new Direction('Москва', '../images/directions/moscow.png'),
                    new Direction('Санкт-Петербург', '../images/directions/spb.png'),
                    new Direction('Уфа', '../images/directions/ufa.png'),
                    new Direction('Нижний Новгород', '../images/directions/nn.png'),
                ]

                // console.log(this.suggestedDirections)
            }
        },

        selectDirection(direction) {
            this.ticketsSearchParams.to = direction.title
            document.getElementsByTagName('header')[0].scrollIntoView({ behavior: "smooth" })
        },

        async submitSearch(event) {
            // get form data (for now, could be changed to correspond with the backend requirements)
            const formData = new FormData(event.target)
            let searchParameters = {}
            for (const [k, v] of formData.entries())
                searchParameters[k] = v

            // activates the progress indicator
            this.dataIsReady = false

            // get raw data
            let searchResults = await this.retrieveTickets(searchParameters)

            // find out what the most expensive and long ticket is
            for (const [id, ticket] of Object.entries(searchResults)) {
                this.minPrice = Math.min(this.minPrice, ticket.price)
                this.maxPrice = Math.max(this.maxPrice, ticket.price)

                this.minDuration = Math.min(this.minDuration, ticket.duration / 60)
                this.maxDuration = Math.max(this.maxDuration, ticket.duration / 60)
            }

            // round bounds to match the step
            this.minPrice -= this.minPrice % 1000
            this.maxPrice += 1000 - this.minPrice % 1000
            this.minDuration = Math.floor(this.minDuration)
            this.maxDuration = Math.ceil(this.maxDuration)

            // select the "maxes" by default
            this.priceFilter = Math.ceil(this.maxPrice)
            this.durationFilter = this.maxDuration

            // set data to trigger the interface update
            this.dataIsReady = true
            this.ticketsSearchResultsUnsorted = searchResults
        },

        async retrieveTickets(searchParameters) {
            // loads raw data without processing it (supposedly from backend)

            let searchResults = {}

            if (constants.isDebug) {
                // let's simulate backend loading the data for now!
                // await new Promise(resolve => setTimeout(resolve, 1000))

                for (let i = 0; i < 10; ++i) {
                    let ticket = Ticket.randomTestData
                    searchResults[ticket.id] = ticket
                }
            }

            return searchResults
        },

        setTestSearchResults() {
            return
            this.ticketsSearchResultsUnsorted = {}

            for (let i = 0; i < 10; ++i) {
                let ticket = Ticket.randomTestData
                this.ticketsSearchResultsUnsorted[ticket.id] = ticket
            }
        },

        decPassengersAmount() {
            if (this.ticketsSearchParams.passengersAmount > 1) {
                --this.ticketsSearchParams.passengersAmount
                this.dataIsReady = false
                this.ticketsSearchResultsUnsorted = []
            }
        },

        incPassengersAmount() {
            ++this.ticketsSearchParams.passengersAmount
            this.dataIsReady = false
            this.ticketsSearchResultsUnsorted = []
        },

        setDepartureDate(event) {
            const newDepartureDate = new Date(event.target.value)
            const now = new Date()

            if (newDepartureDate - now < -3600000 * 23) {
                alert('Вы не можете выбрать дату отправления в прошлом!')
                event.target.value = this.ticketsSearchParams.departureAt
                return
            }

            if (this.ticketsSearchParams.returnAt && newDepartureDate - this.ticketsSearchParams.returnAt >= 0)
            this.ticketsSearchParams.returnAt = null

            this.ticketsSearchParams.departureAt = newDepartureDate

            if (this.dataIsReady)
                document.getElementById('at_ext-ticket-search-form-submit').click()
        },

        setReturnDate(event) {
            const newReturnDate = new Date(event.target.value)
            const now = new Date()

            if (newReturnDate - now < -3600000 * 23 || newReturnDate - this.ticketsSearchParams.departureAt < -3600000 * 23) {
                alert('Вы не можете выбрать дату возвращения в прошлом или раньше даты отправления!')
                event.target.value = this.ticketsSearchParams.returnAt
                return
            }

            this.ticketsSearchParams.returnAt = newReturnDate

            // if (this.ticketsSearchParams.departureAt != null)
            //     this.showCalendar = false

            if (this.dataIsReady)
                document.getElementById('at_ext-ticket-search-form-submit').click()
        },

        toggleTicketLuggageIncluded(ticketId) {
            if (this.ticketsSearchResultsUnsorted[ticketId].freeLuggage)
                return false

            this.ticketsSearchResultsUnsorted[ticketId].luggageIncluded =
                !this.ticketsSearchResultsUnsorted[ticketId].luggageIncluded

            return true
        },

        onWindowScroll(event) {
            const yPos = window.scrollY
            const filtersBoundingRect = document.getElementById('at_ext-tickets-search-filters').getBoundingClientRect()
            const filtersCenterY = filtersBoundingRect.top + filtersBoundingRect.height / 2

            this.showFiltersButtonVisible = filtersCenterY <= 0
            this.stickFiltersOnDesktop = filtersBoundingRect.top <= 30
        },

        scrollToFilters() {
            this.$refs["at_ext-tickets-search-filters"].scrollIntoView({ behavior: "smooth" })
        }
    },

    mounted() {
        this.fetchSuggestedDirections()

        if (constants.isDebug) {
            // this.ticketsSearchParams.from = "Москва"
            // this.ticketsSearchParams.to = "Мурманск"
            // this.ticketsSearchParams.departureAt = new Date()
        }

        this.priceFilter = this.maxPrice
        this.durationFilter = this.maxDuration

        window.addEventListener('scroll', this.onWindowScroll)
    }
})

ticketsSearchApp.mount('#at_ext-tickets-search-app')