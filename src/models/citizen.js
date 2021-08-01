const mongoose = require('mongoose')

const Citizen = mongoose.model('Citizen', {
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        required: true,
    },
    phoneNo: {
        type: String,
        required: true,
    },
    vaccinations: {
        type: Array,
        required: false,
    }
},
'citizen'
)

module.exports = Citizen;