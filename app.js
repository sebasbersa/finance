//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//requiring of modules created by me
const format = require(__dirname + "/app_components/format.js");

const app = express();

//setting ejs 
app.set('view engine', 'ejs')
app.use(express.static("public"));
//setting body-parser
app.use(bodyParser.urlencoded({
    extended: true
  }));

//MONGOOSE CONECTION
mongoose.connect("mongodb+srv://admin-sebastian:910nine99@cluster0.xevar.mongodb.net/financeDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//SCHEMAS MONGOOSE
const flujoSchema = ({
    nombre: String,
    valor: Number,
    fecha: String
});


const usuarioSchema = ({
    nombre: String,
    email: String,
    password: String,
    ingresos: [flujoSchema],
    gastos: [flujoSchema]
});

//MODELS MONGOOSE
const Usuario = mongoose.model("Usuario", usuarioSchema);
const Flujo = mongoose.model("Flujo", flujoSchema);

//  const primero = new Flujo({nombre: "Nuevos", valor: "0", fecha: "05-05-2021"})

// const primerUsuario = new Usuario ({
//     nombre: 'Sebastian',
//     email: 'sebas.ing.civ.berrios@gmail.com',
//     password: '123456',
//     ingresos: [primero],
//     gastos: [primero]
// });

//primerUsuario.save();

// Usuario.findOne({nombre: 'Sebastian'}, function(err,found){
//     if (!err){
//         console.log(found);
//         const ingreso1 = new Flujo ({nombre: "pagina web", valor: "15000", fecha: "06-05-2021"});
//         found.ingresos.push(ingreso1);
//         found.save();
//     }
// });

const userEmail = 'sebas.ing.civ.berrios@gmail.com';


//const gastos = [];
const gastoMensual = [];
const gastoPasivo = []
//const ingresos = [];
const ingresoMensual = [];
const ingresoPasivo = []

//-----------HOME----------------------------
app.get('/', function(req, res){
    res.render("home");
});

//-----------INGRESOS------------------------
app.route('/ingresos')
    .get(function(req, res){
        Usuario.findOne({email: userEmail}, function(err, foundUser){
            if(err){
                console.log(err);
            }else{
                res.render("pages/ingresos", {listIngresos: foundUser.ingresos});
            }
    });
    })
    .post(function(req, res){
        const nIngreso = req.body.nombreIngreso;
        const cantidad = req.body.valorIngreso;
        let date = new Date(req.body.fecha);
        //si la fecha viene vacía se ingresa la fecha de hoy
        if (req.body.fecha === ''){
            date = new Date();
        }
        const ingreso = new Flujo ({nombre: nIngreso, valor: cantidad, fecha: format.formatearFecha(date)});
    
        Usuario.findOne({email: userEmail}, function(err,found){
            if (!err){
                found.ingresos.push(ingreso);
                found.save();
            }
            });
            res.redirect("/ingresos");
        });

//-----------GASTOS------------------------
app.route('/gastos')
    .get(function(req, res){
        Usuario.findOne({email: userEmail}, function(err, foundUser){
            if(err){
                console.log(err);
            }else{
                res.render("pages/gastos", {listGastos: foundUser.gastos});
            }
    });
    })

    .post(function(req, res){
        const nGasto = req.body.nombreGasto;
        const cantidad = req.body.valorGasto;

        let date = new Date(req.body.fecha);
        //si la fecha viene vacía se ingresa la fecha de hoy
        if (req.body.fecha === ''){
            date = new Date();
        }
        const gasto = new Flujo ({nombre: nGasto, valor: cantidad, fecha: format.formatearFecha(date)});

        Usuario.findOne({email: userEmail}, function(err,found){
        if (!err){
            found.gastos.push(gasto);
            found.save();
        }
        });
        res.redirect("/gastos");
    });

app.route('/ingresos/delete')
    .post(function(req, res){
        const elemento = req.body;
        Usuario.updateOne(
            { email: userEmail },
            { $pull: { ingresos: { _id: elemento.id } } },
            { multi: false },function(err){
                if(err){
                    console.log(err);
                }
            }
          );
        res.redirect("/ingresos");
    });
app.route('/gastos/delete')
    .post(function(req, res){
        const elemento = req.body;
        Usuario.updateOne(
            { email: userEmail },
            { $pull: { gastos: { _id: elemento.id } } },
            { multi: false },function(err){
                if(err){
                    console.log(err);
                }
            }
          );
        res.redirect("/gastos");
    });







//inicializacion del puerto
app.listen(process.env.PORT || 3000, function(){
    console.log("se escucha el puerto 3.000");
  });
  

