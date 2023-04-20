import { TicketClass, TicketClassDisplayName } from './ticket-class.js'
import Airport from './airport.js'
import Exchange from './exchange.js'

function timeToStr(date) {
    console.log(date)
    let hoursStr = `00${date.getHours()}`
    hoursStr = hoursStr.substring(hoursStr.length - 2)

    let minutesStr = `00${date.getMinutes()}`
    minutesStr = minutesStr.substring(minutesStr.length - 2)

    return `${hoursStr}:${minutesStr}`
}

class Ticket {
    constructor(id, from, to, exchanges, departureAt, returnAt,
                price, luggagePrice, luggageIncluded=false,
                passengersList=[], ticketClass=TicketClass.economy) {
        this.id = id
        this.from = from
        this.to = to
        this.departureAt = departureAt
        this.returnAt = returnAt
        this.exchanges = exchanges
        this.price = price
        this.luggagePrice = luggagePrice

        this.luggageIncluded = luggageIncluded || (this.luggagePrice === 0)

        this.passengersList = []
        this.ticketClass = ticketClass
    }

    get ['exchangesAmount']() {
        return this.exchanges.length
    }

    get ['priceString']() {
        let hundreds = `000${this.price % 1000}`
        hundreds = hundreds.substring(hundreds.length - 3)
        return `${(this.price - this.price % 1000) / 1000} ${hundreds}`
    }

    get ['freeLuggage']() {
        return this.luggagePrice === 0
    }

    get ['isDirect']() {
        return this.exchangesAmount === 0
    }

    get ['departureAtStr']() {
        return timeToStr(this.departureAt)
    }

    get ['returnAtStr']() {
        return timeToStr(this.returnAt)
    }

    get ['duration']() {
        let delta = new Date(this.returnAt - this.departureAt)
        return delta.getDay() * 24 * 60 + delta.getHours() * 60 + delta.getMinutes()
    }

    get ['durationHours']() {
        return (this.duration - this.duration % 60) / 60
    }

    get ['classDisplayName']() {
        return TicketClassDisplayName[this.ticketClass]
    }

    static get['randomTestData']() {
        const departureAt = new Date()

        const ticket = new Ticket(
            crypto.randomUUID(),
            new Airport('DME', 'Домодедово', 'Москва'),
            new Airport('MMK', 'Аэропорт Мурманска', 'Мурманск'),
            [
                new Exchange(
                    new Airport('LED', 'Пулково', 'Санкт-Петербург'),
                    180,
                    departureAt + new Date(0, 0, 0, 240),
                )
            ],
            departureAt,
            new Date(departureAt.getTime() + 5 * 24 * ((Math.random() * 100) % 60) * 60000),
            Math.round(100 + (Math.random() * 1000) % 899) * 100,
            Math.round(2 + (Math.random() * 10) % 3) * 1000,
        )

        if (Math.random() < 0.5) {
            ticket.luggagePrice = 0
            ticket.luggageIncluded = true
        }

        if (Math.random() < 0.5) {
            ticket.exchanges = []
        }

        return ticket
    }
}

export default Ticket