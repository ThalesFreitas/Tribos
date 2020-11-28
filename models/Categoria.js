const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const date = new Date()
const datapublicacao = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear()



const Categoria = new Schema({
    nome: {
        type:String,
        require: true
    },
    slug: {
        type: String,
        required: true
    },
    date: {
        type: String,
        
        default: datapublicacao
        
    }
})

mongoose.model("categorias", Categoria)