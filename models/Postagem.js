const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const aws = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');



const s3 = new aws.S3();


var date = new Date()
var datapublicacao = date.getDate() + "/" + (date.getMonth()+1) + "/" + date.getFullYear()


const Postagem = new Schema({

    nome:{
        type: String,
        required: true
    },

    slugtema: {
        type: Schema.Types.ObjectId,
        ref: "slugtemas",
        required: true
    },

    categoria: {
        type: Schema.Types.ObjectId,
        ref: "categorias",
        required: true
    },
    modelo: {
        type: Schema.Types.ObjectId,
        ref: "modelos",
        required: true
    },
    
    data: {
        type: String,
        
        default: datapublicacao
       
       
    },

    
    name: {
        type: String
        
    },
    size: {
       type: Number
    },
    key: {
       type: String
    },
    url: {
       type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    
});


Postagem.pre('save', function() {
    if (!this.url) {
        this.url = `${process.env.APP_URL}/public/img/uploads/${this.key}`;
    }
});

Postagem.pre('remove', function() {
    if(process.env.STORAGE_TYPE == 's3') {
        return s3.deleteObject({
            Bucket: 'uploadmpdecoracoes',
            Key: this.key,

        }).promise()
    }else{
return promisify(fs.unlink)(
path.resolve(__dirname, "..", "public", "img", "uploads", this.key)
);
    }
});

mongoose.model("postagens", Postagem);



