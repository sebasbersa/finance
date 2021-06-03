//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const format = require(__dirname + "/app_components/format.js");

const app = express();

//setting ejs 
app.set('view engine', 'ejs')
app.use(express.static("public"));
//setting body-parser
app.use(bodyParser.urlencoded({
    extended: true
  }));

const gastos = [];
const gastoMensual = [];
const gastoPasivo = []
const ingresos = [];
const ingresoMensual = [];
const ingresoPasivo = []

//-----------GET REQUEST'S----------------------------
app.get('/', function(req, res){
    res.render("home", { listGastos: gastos, listIngresos: ingresos});
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
    const ingresar = {nombre: nGasto, valor: cantidad, fecha: format.formatearFecha(date)}
    gastos.push(ingresar);
    res.redirect("/");
});

app.post("/ingreso", function(req, res){
    const nIngreso = req.body.nombreIngreso;
    const cantidad = req.body.valorIngreso;
    let date = new Date(req.body.fecha);
    //si la fecha viene vacía se ingresa la fecha de hoy
    if (req.body.fecha === ''){
        date = new Date();
    }
    const ingresar = {nombre: nIngreso, valor: cantidad, fecha: format.formatearFecha(date)}
    ingresos.push(ingresar);
    res.redirect("/");
});

//inicializacion del puerto
app.listen(process.env.PORT || 3000, function(){
    console.log("se escucha el puerto 3.000");
  });
  

