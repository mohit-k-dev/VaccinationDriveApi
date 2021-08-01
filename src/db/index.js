const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://socialpilot:1234567890@socialpilot.qooij.mongodb.net/test?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    dbName: 'drive6'
})