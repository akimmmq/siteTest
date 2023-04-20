import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'
import constants from '../scripts/ahmadshah-tickets-ext-constants.js'

class ResidencyType {
    constructor(label, countryCode, isDefault=false) {
        this.label = label
        this.countryCode = countryCode
        this.iconUrl = 'https://flagcdn.com/w80/' + countryCode + '.png'
        this.isDefault = isDefault
    }
}

const personalDataApp = createApp({
    data() {
        return {
            adultsAmount: 0,
            adults: [],

            residencyTypes: {
                'ru': new ResidencyType('Россия', 'ru', true),
                'ua': new ResidencyType('Украина', 'ua'),
                'by': new ResidencyType('Беларусь', 'by'),
                'kz': new ResidencyType('Казахстан', 'kz'),
            }
        }
    },

    methods: {
        addAdult() {
            const emptyAdult = {
                localID: this.adults.length,
                residency: 'ru',
                idType: 'internationalPassport',
                idNumber: '',
                sex: 'm',
                surname: '',
                name: '',
                birthdate: Date.now() - new Date(18),
                lastname: '',
                phoneNumber: '',
                email: ''
            }

            this.adults.push(emptyAdult)
        },

        submitAdultsList() {
            console.log(this.adults)
        },

        changeResidency(adultID, newResidency) {
            this.adults[adultID].residency = newResidency
            console.log(newResidency)
        }
    },

    mounted() {
        // collect data from the query string
        let urlParamsString = window.location.search
        let params = new URLSearchParams(urlParamsString)

        if (!params.has('adultsAmount')) {
            alert('Вероятно, страница была открыта по ошибке. Перенаправляем Вас на главную')
            if (!this.isDebug)
                window.location.assign('/')
            else
                params.set('adultsAmount', 2)
        }

        this.adultsAmount = parseInt(params.get('adultsAmount'))

        for (let i = 0; i < this.adultsAmount; ++i)
            this.addAdult()
    },

    computed: {
        isDebug() {
            return constants.isDebug
        },
    }
})

personalDataApp.mount('#at_ext-personal-data-app')