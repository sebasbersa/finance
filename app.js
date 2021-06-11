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
//
// //MODELS MONGOOSE
const Usuario = mongoose.model("Usuario", usuarioSchema);
const Flujo = mongoose.model("Flujo", flujoSchema);

let dInGasto = null;
let dEndGasto = null;
let dInIngreso = null;
let dEndIngreso = null;

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

//-------- const pagination tables
const perPage = 6;

//-----------HOME----------------------------
app.get('/', function(req, res){
    res.render("home");
});


//-----------INGRESOS------------------------
app.route('/ingresos')
.get(function(req, res){
  const page = req.query.page || 1;
  const dateIn = req.query.dateIn;
  const dateEnd = req.query.dateEnd;
    Usuario.findOne({email: userEmail}, function(err, foundUser){
        if(err){
            console.log(err);
        }else{
            if(dateIn != null && dateEnd != null){
              res.render("pages/ingresos", {
                pages: Math.ceil(foundUser.ingresos.length/perPage),
                current: page,
                dateIn: dateIn,
                dateEnd: dateEnd,
                listIngresos: foundUser.ingresos.filter(ingreso => format.entreFechas(ingreso.fecha, dateIn, dateEnd)).slice(perPage * page - perPage , perPage * page )
                });
              }else{
                res.render("pages/ingresos", {
                  pages: Math.ceil(foundUser.ingresos.length/perPage),
                  current: page,
                  dateIn: dateIn,
                  dateEnd: dateEnd,
                  listIngresos: foundUser.ingresos.slice(perPage * page - perPage , perPage * page )});
                }
        }
});
})
  .post(function(req, res){
    const page = req.query.page || 1;
    const dateIn = String(req.body.dateIn);
    const dateEnd = String(req.body.dateEnd);
    if(dateIn != null && dateEnd != null){
      dInIngreso = dateIn;
      dEndIngreso = dateEnd;
    res.redirect("/ingresos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);

  }
  });

app.post("/ingresos/pages", function(req, res){
    const page = req.body.button;
    const dateIn = dInIngreso;
    const dateEnd = dEndIngreso;
    let url = "/ingresos";
      url = url + "?page=" + page;
      if (dateIn != null && dateEnd != null){
        url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
      }
      res.redirect(url);

  });
app.post("/ingresos/xFiltro", function(req, res){
          const page = 1;
          const dateIn = null;
          const dateEnd = null;
          dInIngreso = null;
          dEndIngreso = null;
          let url = "/ingresos";
            url = url + "?page=" + page;
            if (dateIn != null && dateEnd != null){
              url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
            }
            res.redirect(url);
        });

app.post("/ingresos/nIngreso", function(req,res){

            const nIngreso = req.body.nombreIngreso;
            const cantidad = req.body.valorIngreso;

            let date = new Date(req.body.fecha);
            //si la fecha viene vacía se ingresa la fecha de hoy
            if (req.body.fecha === ''){
                date = new Date();
            }
            const gasto = new Flujo ({nombre: nIngreso, valor: cantidad, fecha: format.formatearFecha(date)});

            Usuario.findOne({email: userEmail}, function(err,found){
            if (!err){
                found.ingresos.push(gasto);
                found.save();
            }
            });
            res.redirect("/ingresos");
            });
//-----------GASTOS------------------------
app.route('/gastos')
    .get(function(req, res){
      const page = req.query.page || 1;
      const dateIn = req.query.dateIn;
      const dateEnd = req.query.dateEnd;
        Usuario.findOne({email: userEmail}, function(err, foundUser){
            if(err){
                console.log(err);
            }else{
                if(dateIn != null && dateEnd != null){
                  res.render("pages/gastos", {
                    pages: Math.ceil(foundUser.gastos.length/perPage),
                    current: page,
                    dateIn: dateIn,
                    dateEnd: dateEnd,
                    listGastos: foundUser.gastos.filter(gasto => format.entreFechas(gasto.fecha, dateIn, dateEnd)).slice(perPage * page - perPage , perPage * page )
                    });
                  }else{
                    res.render("pages/gastos", {
                      pages: Math.ceil(foundUser.gastos.length/perPage),
                      current: page,
                      dateIn: dateIn,
                      dateEnd: dateEnd,
                      listGastos: foundUser.gastos.slice(perPage * page - perPage , perPage * page )});
                    }
            }
    });
    })

    .post(function(req, res){
      const page = req.query.page || 1;
      const dateIn = String(req.body.dateIn);
      const dateEnd = String(req.body.dateEnd);
      if(dateIn != null && dateEnd != null){
        dInGasto = dateIn;
        dEndGasto = dateEnd;
      res.redirect("/gastos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);

    }
    });

app.post("/gastos/pages", function(req, res){
  const page = req.body.button;
  const dateIn = dInGasto;
  const dateEnd = dEndGasto;
  let url = "/gastos";
    url = url + "?page=" + page;
    if (dateIn != null && dateEnd != null){
      url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
    }
    res.redirect(url);

});

app.post("/gastos/xFiltro", function(req, res){
  const page = 1;
  const dateIn = null;
  const dateEnd = null;
  dInGasto = null;
  dEndGasto = null;
  let url = "/gastos";
    url = url + "?page=" + page;
    if (dateIn != null && dateEnd != null){
      url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
    }
    res.redirect(url);
});

app.post("/gastos/nGasto", function(req,res){

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

//-------- DELETE-----------------
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
