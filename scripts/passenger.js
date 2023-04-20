class Passenger {
    constructor(id, firstName, surname, lastName, seat) {
        this.firstName = firstName
        this.surname = surname
        this.lastName = lastName
        this.seat = seat
    }

    static get['randomTestData']() {
        if (Math.random() < 0.5) {
            return new Passenger(
                crypto.randomUUID(),
                'Тимофей',
                'Емельянов',
                'Алексеевич',
                '13A'
            )
        }

        return new Passenger(
            crypto.randomUUID(),
            'Иван',
            'Иванов',
            'Иванович',
            '36A'
        )
    }
}

export default Passenger