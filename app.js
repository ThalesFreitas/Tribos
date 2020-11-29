require('dotenv').config();
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require("./routes/admin")
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')

const fs = require('fs')
const {promisify} = require('util')


const html2canvas = require('html2canvas')

const multer = require('multer')
const multerConfig = require('./src/config/multer')


require("./models/Postagem")
const Postagem = mongoose.model("postagens")

require("./models/Slugtema")
const Slugtema = mongoose.model("slugtemas")

require("./models/Categoria")
const Categoria = mongoose.model("categorias")


require("./models/Modelo")
const Modelo = mongoose.model("modelos")


const usuarios = require("./routes/usuario")
const passport = require('passport')
require("./config/auth")(passport)



const cors = require('cors');
const { json } = require('body-parser');
const { parseJSON } = require('date-fns');
const { request } = require('http');
const { DataBrew } = require('aws-sdk');
const { post } = require('./routes/admin');


app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));




// Config 
    //Sessão
    app.use(session({
        secret: "mp",
        resave: true,
        saveUninitialized: true
    }))
    //Passport
    app.use(passport.initialize())
    app.use(passport.session())
     
    //Flash
    app.use(flash())
//Middleware
app.use((req, res,next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

//Template Engine Handlebars
app.engine('handlebars', handlebars({defaultLayout: 'main'

    }))
app.set('view engine', 'handlebars')

//Body Parser
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//Mongoose
//mongoose.Promise = global.Promise;

mongoose.connect(process.env.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => {
    console.log("Conectado ao mongo")
}).catch((err) => {
console.log("Erro ao se conectar: "+err)
})

// Definindo pasta do arquivo statico
app.use(express.static(path.join(__dirname,"public")))




//Rotas

app.get('/',  async (req, res) => {
   
    const post = await Postagem.deleteMany();
    
    //const img = path.resolve(__dirname, "public", "img", "uploads", "mtb.jpg")
    //if(img){
        //fs.unlinkSync(img)
    //}
   // fs.unlinkSync(img);
   res.render('./index')
})

//formulario
app.get('/cadastro', (req, res) => {
     res.render('./formulario')
});
//template
app.get('/template', (req, res) => {
   
    Postagem.find().lean().populate().then((postagens) => {

    res.render('./template' ,{postagens: postagens})
    })
});

app.post('/cadastro/criar', multer(multerConfig).single('file'), (req, res) => {
    

    const { originalname: name, size, key, location: url = ''} = req.file;
    
    
    const post ={
   
        nome: req.body.nome,
        equipe: req.body.equipe,
        cidade: req.body.cidade,
       
   
    name,
    size,
    key,
    url
}
console.log(post)

Postagem(post).save().then(() => {
      
    req.flash("success_msg", "Banner criado com sucesso!")
    res.redirect("/template")
   
}).catch((err) => {
    req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
    res.redirect("/template")
})
    
})

app.get("/deletar" , async (req, res) => {
    
    const post = await Postagem.deleteMany();
    const img = path.resolve(__dirname, "public", "img", "uploads", "mtb.jpg")
    fs.unlinkSync(img);
    res.redirect("/cadastro")

    //const result = await Postagem.deleteMany();
    //await result.remove();
   // res.redirect('/');
})

//Teste JSON cpostagens
app.get('/api', (request, response) => {
    
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).populate("modelo").then((postagens) => {
       
    Slugtema.find().lean().then((slugtemas) => {
        

    Categoria.find().lean().then((categorias) => {
        
          
     Modelo.find().lean().then((modelos) => {
        
    
  /*response.render('index2', {postagens: postagens,slugtemas: slugtemas,categorias: categorias,modelos: modelos});*/
  
  return response.json(postagens);
 
  
  
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao listar os modelos")
        res.redirect("/")
})

}).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao listar as categorias")
    res.redirect("/")
})

}).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao listar os slugtemas")
    res.redirect("/")
})

}).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao listar as postagens")
    res.redirect("/")
})
   
})
/////

            //Listar temas disponiveis
        app.get("/temas/:slugtema", (req, res) => {
             Slugtema.findOne({slugtema: req.params.slugtema}).then((slugtema) => {
             if(slugtema){
            
             Postagem.find({slugtema: slugtema._id}).lean().populate("categoria").sort({data: "desc"}).populate("modelo").then((postagens) => {
            
            Slugtema.find().lean().then((exibirslugtemas) => {
            
            res.render("temas/index", {postagens: postagens, slugtema: slugtema, slugtemas: exibirslugtemas})
            
            }).catch((err) => {
                req.flash("error_msg", "Houve um erro ao listar os temas!")
                res.redirect("/")
            })
        })
        }else{
            req.flash("error_msg", "Este tema não existe")
            res.redirect("/")
        }

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a página deste tema")
        res.redirect("/")
    })
})
  
            //Listar categorias
            app.get("/categorias/:slug", (req, res) => {
                Categoria.findOne({slug: req.params.slug}).then((categoria) => {
                    if(categoria){
                        
                    Postagem.find({categoria: categoria._id}).lean().populate("categoria").sort({data: "desc"}).populate("modelo").then((postagens) => {
                       

                        Categoria.find().lean().then((exibircategorias) => {

                        res.render("categorias/index", {postagens: postagens, categoria: categoria, categorias: exibircategorias})
        
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao listar a categoria!")
                            res.redirect("/")
                        })
                    })
                    }else{
                        req.flash("error_msg", "Esta categoria não existe")
                        res.redirect("/")
                    }
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
                    res.redirect("/")
                })
            })
           

            //Listar modelos
            app.get('/modelos/:slug', (req, res) => {


                Modelo.findOne({slug: req.params.slug}).then((modelo) => {
                    
                        
                    Postagem.find({modelo: modelo._id}).lean().populate("categoria").sort({data: "desc"}).populate("modelo").then((postagens) => {


                        Modelo.find().lean().then((exibirmodelos) => {
                        res.render("modelos/index", {postagens: postagens, modelo: modelo, modelos: exibirmodelos})
                        
                        }).catch((err) => {
                            req.flash("error_msg", "Houve um erro ao listar os modelos")
                            res.redirect("/")
                        })
                            
                        
                    })   
                }).catch((err) => {
                    req.flash("error_msg", "Houve um erro interno ao carregar a página deste modelo")
                    res.redirect("/")
                })
            })
        
               

    app.get("/404", (req, res) => {
        res.send("Erro 404!")
    })


app.use('/admin', admin)
app.use("/usuarios", usuarios)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Servidor Rodando")
})