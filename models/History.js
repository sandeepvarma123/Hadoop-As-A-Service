const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    jobName: {
        type: String,
        required: true
    },
    jobStatus: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
});


const History = mongoose.model('History', HistorySchema);

module.exports = History;