const mongoose = require('mongoose')
const Schema = mongoose.Schema;


var date = new Date()
var datapublicacao = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear()


const Slugtema = new Schema({
   
    slugtema: {
        type: String,
        require: true
    },
    date: {
        type: String,
        default: datapublicacao
        
    }
});

mongoose.model("slugtemas", Slugtema)
