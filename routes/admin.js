require('dotenv').config();
const express = require('express')
const router = express.Router()
const multer = require('multer')
const multerConfig = require('../src/config/multer')
const path = require('path')
const fs = require('fs');
const {promisify} = require('util');

const aws = require('aws-sdk');
const s3 = new aws.S3();

//Importando model de forma externa
//chama o mongoose
//importa o arquivo do model
//chama essa função que vai passar uma referencia do seu model pra uma variavel
const mongoose = require('mongoose')

require("../models/Categoria")
const Categoria = mongoose.model("categorias")


require("../models/Slugtema")
const Slugtema = mongoose.model("slugtemas")


require("../models/Modelo")
const Modelo = mongoose.model("modelos")


require("../models/Postagem")
const Postagem = mongoose.model("postagens")




//Importando helpers
const {eAdmin}= require("../helpers/eAdmin")


router.get('/', eAdmin, (req, res) => {
   res.render("admin/index")
   
})

//Rotas Admin


// Rota Admin Listar categorias
router.get('/categorias', eAdmin, (req, res) => {
    
    Categoria.find().sort({data: 'desc'}).then((categorias) => {
        res.render('./admin/categorias', {categorias: categorias.map(Categoria =>
           Categoria.toJSON())})
           
    
    }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias!")
    res.redirect('/admin')
    })

    
})




// Rota Admin Listar Slugtemas
router.get('/slugtemas', eAdmin, (req, res) => {
    Slugtema.find().sort({data: 'desc'}).then((slugtemas) => {
        res.render('./admin/slugtemas', {slugtemas: slugtemas.map(Slugtema =>
            Slugtema.toJSON())})
           
    }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar os temas disponiveis!")
    res.redirect('/admin')
    })
})

// Rota Admin Listar modelos
router.get('/modelos', eAdmin, (req, res) => {
    Modelo.find().sort({date: 'desc'}).then((modelos) => {
        res.render('./admin/modelos', {modelos: modelos.map(Modelo =>
            Modelo.toJSON())})
    }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar os modelos!")
    res.redirect('/admin')
    })
})

//Rota Admin Cadastro Categoria
router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})
//Rota Admin Cadastro Slugtema
router.get('/slugtemas/add', eAdmin, (req, res) => {
    res.render("admin/addslugtemas")
})

//Rota Admin Cadastro Modelo
router.get('/modelos/add', eAdmin, (req, res) => {
    res.render("admin/addmodelos")
})


////Rota Admin Salvar Categoria no Mongodb
router.post('/categorias/nova', eAdmin, (req, res) => {
    
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Slug inválido"})
    }
    if(req.body.nome.length < 2){
    erros.push({texto: "Nome da categoria é muito pequeno"})
    }
    if(req.body.slug.length < 2){
        erros.push({texto: "Slug da categoria é muito pequeno"})
        }
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    }
})


////Rota Admin Salvar Slugtema no Mongodb
router.post('/slugtemas/nova', eAdmin, (req, res) => {
    
    var erros = []
    if(!req.body.slugtema || typeof req.body.slugtema == undefined || req.body.slugtema == null){
    erros.push({texto: "Slug inválido"})
    }
    if(req.body.slugtema.length < 2){
        erros.push({texto: "Slug é muito pequeno"})
        }
    if(erros.length > 0){
        res.render("admin/addslugtemas", {erros: erros})
    }else{
        const novoSlug = {
            slugtema: req.body.slugtema
        }
        new Slugtema(novoSlug).save().then(() => {
            req.flash("success_msg", "Slug do tema criado com sucesso!")
            res.redirect("/admin/slugtemas")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar o slug do tema, tente novamente!")
            res.redirect("/admin")
        })
    }
})


////Rota Admin Salvar Modelo no Mongodb
router.post('/modelos/nova', eAdmin, (req, res) => {
    
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Slug inválido"})
    }
    if(req.body.nome.length < 2){
    erros.push({texto: "Nome do modelo é muito pequeno"})
    }
    if(req.body.slug.length < 2){
        erros.push({texto: "Slug do modelo é muito pequeno"})
        }
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novoModelo = {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Modelo(novoModelo).save().then(() => {
            req.flash("success_msg", "Modelo criado com sucesso!")
            res.redirect("/admin/modelos")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao salvar o modelo, tente novamente!")
            res.redirect("/admin")
        })
    }
})

////Rota Admin Editar Categoria
router.get("/categorias/edit/:id", eAdmin, (req, res) => {
    Categoria.findOne({_id:req.params.id}).lean().then((categoria) => {
        res.render("admin/editcategorias", {categoria: categoria})

    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias")
    })
})

////Rota Admin Editar Slugtema
router.get("/slugtemas/edit/:id", eAdmin, (req, res) => {
    Slugtema.findOne({_id:req.params.id}).lean().then((slugtema) => {
        res.render("admin/editslugtemas", {slugtema: slugtema})

    }).catch((err) => {
        req.flash("error_msg", "Esse tema não existe")
        res.redirect("/admin/slugtemas")
    })
})

////Rota Admin Editar Modelo
router.get("/modelos/edit/:id", eAdmin, (req, res) => {
    Modelo.findOne({_id:req.params.id}).lean().then((modelo) => {
        res.render("admin/editmodelos", {modelo: modelo})

    }).catch((err) => {
        req.flash("error_msg", "Este modelo não existe")
        res.redirect("/admin/modelos")
    })
})


////Rota Admin Salvar Edição Categoria
router.post("/categorias/edit", eAdmin, (req, res) => {

    //validação do formulario
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Slug inválido"})
    }
    if(req.body.nome.length < 2){
    erros.push({texto: "Nome da categoria é muito pequeno"})
    }
    if(req.body.slug.length < 2){
        erros.push({texto: "Slug da categoria é muito pequeno"})
        }
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        //Se os dados estiver num formato valido, então é salvo a edição
        //Busca uma categoria pelo id
        Categoria.findOne({_id: req.body.id}).then((categoria) => {
            //atualiza os campos
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
            //salva os dados no banco
        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição da categoria")
            res.redirect("/admin/categorias")
        })

    }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao editar a categoria")
    res.redirect("/admin/categorias")
    })
}
})

////Rota Admin Salvar Edição Slugtema
router.post("/slugtemas/edit", eAdmin, (req, res) => {

    //validação do formulario
    var erros = []
    if(!req.body.slugtema || typeof req.body.slugtema == undefined || req.body.slugtema == null){
    erros.push({texto: "Slug inválido"})
    }
    if(req.body.slugtema.length < 2){
        erros.push({texto: "Slug é muito pequeno"})
        }
    if(erros.length > 0){
        res.render("admin/addslugtemas", {erros: erros})
    }else{
        //Se os dados estiver num formato valido, então é salvo a edição
        //Busca o slugtema pelo id
        Slugtema.findOne({_id: req.body.id}).then((slugtema) => {
            //atualiza os campos
        slugtema.slugtema = req.body.slugtema
            //salva os dados no banco
        slugtema.save().then(() => {
            req.flash("success_msg", "Slug do tema editado com sucesso!")
            res.redirect("/admin/slugtemas")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição do slug")
            res.redirect("/admin/slugtemas")
        })

    }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao editar a categoria")
    res.redirect("/admin/slugtemas")
    })
}
})

////Rota Admin Salvar Edição Modelo
router.post("/modelos/edit", eAdmin, (req, res) => {

    //validação do formulario
    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    erros.push({texto: "Nome inválido"})
    }
    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    erros.push({texto: "Slug inválido"})
    }
    if(req.body.nome.length < 2){
    erros.push({texto: "Nome do modelo é muito pequeno"})
    }
    if(req.body.slug.length < 2){
        erros.push({texto: "Slug do modelo é muito pequeno"})
        }
    if(erros.length > 0){
        res.render("admin/addmodelos", {erros: erros})
    }else{
        //Se os dados estiver num formato valido, então é salvo a edição
        //Busca um modelo pelo id
        Modelo.findOne({_id: req.body.id}).then((modelo) => {
            //atualiza os campos
        modelo.nome = req.body.nome
        modelo.slug = req.body.slug
            //salva os dados no banco
        modelo.save().then(() => {
            req.flash("success_msg", "Modelo editado com sucesso!")
            res.redirect("/admin/modelos")
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro interno ao salvar a edição do modelo")
            res.redirect("/admin/modelos")
        })

    }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao editar o modelo")
    res.redirect("/admin/modelos")
    })
}
})


////Rota Admin Deletar Categoria
router.post("/categorias/deletar", eAdmin, (req, res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso!")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})

////Rota Admin Deletar Slugtema
router.post("/slugtemas/deletar", eAdmin, (req, res) => {
    Slugtema.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Slug do tema deletado com sucesso!")
        res.redirect("/admin/slugtemas")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar o slug do tema")
        res.redirect("/admin/slugtemas")
    })
})

////Rota Admin Deletar Modelo
router.post("/modelos/deletar", eAdmin, (req, res) => {
    Modelo.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg", "Modelo deletado com sucesso!")
        res.redirect("/admin/modelos")
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao deletar o modelo")
        res.redirect("/admin/modelos")
    })
})
////////Painel ADM Remover Temas
router.get("/removetema/:slugtema", eAdmin, (req, res) => {
    Slugtema.findOne({slugtema: req.params.slugtema}).then((slugtema) => {
    if(slugtema){
   
    Postagem.find({slugtema: slugtema._id}).lean().populate("categoria").sort({data: "desc"}).populate("modelo").then((postagens) => {
   
   Slugtema.find().lean().then((exibirslugtemas) => {
   
   res.render("temas/removetema", {postagens: postagens, slugtema: slugtema, slugtemas: exibirslugtemas})
   
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

//Painel ADM Listar Posts
router.get("/postagens", eAdmin, (req, res) => {
    //Exibir postagens pela data
    Postagem.find().lean().populate("categoria").sort({data: "desc"}).populate("modelo").then((postagens) => {
       
    Slugtema.find().lean().then((slugtemas) => {
        res.render("admin/postagens", {postagens: postagens, slugtemas: slugtemas})

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os temas")
        res.redirect("/admin")
    })
}).catch((err) => {
    req.flash("error_msg", "Houve um erro interno ao listar as postagens")
    res.redirect("/")
})
})


////Rota Admin Cadastro de  Postagem
router.get("/postagens/add", eAdmin, (req, res) => {
    
   Categoria.find().lean().then((categorias) => {

    Slugtema.find().lean().then((slugtemas) => {
       
       
     Modelo.find().lean().then((modelos) => {
            res.render("admin/addpostagem", {categorias: categorias,slugtemas: slugtemas,modelos: modelos})
      
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os modelos")
        res.redirect("/admin")
    })
   
}).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar os slug temas")
    res.redirect("/admin")
})
}).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias")
    res.redirect("/admin")
})
})


////Rota Admin Salvar Postagem com Amazon S3
router.post("/postagens/nova", multer(multerConfig).single('file'), eAdmin, (req, res) => {


    const { originalname: name, size, key, location: url = ''} = req.file;
    
    
        const post ={
       
            nome: req.body.nome,
            slugtema: req.body.slugtema,
            categoria: req.body.categoria,
            modelo: req.body.modelo,
       
        name,
        size,
        key,
        url
    }

    Postagem(post).save().then(() => {
          
        req.flash("success_msg", "Postagem criada com sucesso!")
        res.redirect("/admin/postagens")
       
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro durante o salvamento da postagem")
        res.redirect("/admin/postagens")
    })
        
    })

   

//Editando postagens
router.get("/postagens/edit/:id/:key", eAdmin, (req, res) => {
     

    const keys = req.params.key;
    console.log(keys)
    
    const s3Params = {
        Bucket: 'uploadmpdecoracoes',
        Key: keys,
    }
    s3.deleteObject(s3Params, (err, data) => {
        
    })
   
    
 Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {

  Categoria.find().lean().then((categorias) => {
  Slugtema.find().lean().then((slugtemas) => {
  Modelo.find().lean().then((modelos) => {
    res.render("admin/editpostagens", {postagem: postagem,slugtemas: slugtemas,categorias: categorias,modelos: modelos })
    
   //const post = await Postagem.findById(req.params.id);
  
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os modelos")
        res.redirect("/admin/postagens")
    })
}).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar os slug temas")
    res.redirect("/admin/postagens")
})
}).catch((err) => {
    req.flash("error_msg", "Houve um erro ao listar as categorias")
    res.redirect("/admin/postagens")
})
}).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
    res.redirect("/admin/postagens")
})

})

//Atualiza os dados da postagem editada
router.post("/postagem/edit", multer(multerConfig).single('file'), eAdmin, (req, res) => {
   
  Postagem.findOne({_id: req.body.id}).then((postagem) => {
   
        const { originalname: name, size, key, location: url = ''} =  req.file;
       
    
        postagem.nome = req.body.nome
        postagem.slugtema = req.body.slugtema
        postagem.categoria = req.body.categoria
        postagem.modelo =  req.body.modelo
        
        postagem.name = name
        postagem.size = size
        postagem.key = key
        postagem.url = url

        
            postagem.save().then(() => {
                 
            
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")

        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao salvar a edição")
        res.redirect("/admin/postagens")
    })

})


//////Rota Admin Deletar Postagem
router.get("/postagens/deletar/:id" , eAdmin, async (req, res) => {
    const post = await Postagem.findById(req.params.id);
    await post.remove();
    req.flash("success_msg", "Postagem deletada com sucesso!")
    res.redirect("/admin/postagens")
    
       
    
})



module.exports = router