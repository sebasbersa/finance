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
mongoose.connect("mongodb://localhost:27017/financeDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

//SCHEMAS MONGOOSE
const gastosSchema = {
    nombre: String,
    valor: Number,
    fecha: String
}
const ingresosSchema = {
    nombre: String,
    valor: Number,
    fecha: String
}

//MODELS MONGOOSE
const Gasto = mongoose.model("Gasto", gastosSchema);
const Ingreso = mongoose.model("Ingreso", gastosSchema);



//const gastos = [];
const gastoMensual = [];
const gastoPasivo = []
//const ingresos = [];
const ingresoMensual = [];
const ingresoPasivo = []

//-----------GET REQUEST'S----------------------------
app.get('/', function(req, res){
    res.render("home");
});

app.get('/ingresos', function(req, res){
    Ingreso.find({}, function(error, foundIngresos){
        if(error){
            console.log(error);
        }else{
            res.render("pages/ingresos", {listIngresos: foundIngresos});
        }
});
});
app.get('/gastos', function(req, res){
    Gasto.find({}, function(err, foundGastos){
        if(err){
            console.log(err);
        }else{
            res.render("pages/gastos", {listGastos: foundGastos});
        }
});
});


//-----------POST REQUEST'S----------------------------
app.post("/gasto", function(req, res){
    const nGasto = req.body.nombreGasto;
    const cantidad = req.body.valorGasto;

    let date = new Date(req.body.fecha);
    //si la fecha viene vacía se ingresa la fecha de hoy
    if (req.body.fecha === ''){
        date = new Date();
    }
    const ingresar = new Gasto ({nombre: nGasto, valor: cantidad, fecha: format.formatearFecha(date)});

    ingresar.save();
    res.redirect("/gastos");
});

app.post("/ingreso", function(req, res){
    const nIngreso = req.body.nombreIngreso;
    const cantidad = req.body.valorIngreso;
    let date = new Date(req.body.fecha);
    //si la fecha viene vacía se ingresa la fecha de hoy
    if (req.body.fecha === ''){
        date = new Date();
    }
    const ingresar = new Ingreso ({nombre: nIngreso, valor: cantidad, fecha: format.formatearFecha(date)});
    ingresar.save();
    res.redirect("/ingresos");
});

//inicializacion del puerto
app.listen(process.env.PORT || 3000, function(){
    console.log("se escucha el puerto 3.000");
  });
  

