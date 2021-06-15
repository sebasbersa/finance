//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//requiring of modules created by me
const format = require(__dirname + "/app_components/format.js");

const app = express();

//setting ejs
app.set('view engine', 'ejs');
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
    fecha: Date
});
const dineroSchema = ({
  nombre: String,
  dinero: Number
});

const usuarioSchema = ({
    nombre: String,
    email: String,
    password: String,
    ingresos: [flujoSchema],
    gastos: [flujoSchema],
    activos: [dineroSchema],
    pasivos: [dineroSchema]
});


//
// //MODELS MONGOOSE
const Usuario = mongoose.model("Usuario", usuarioSchema);
const Flujo = mongoose.model("Flujo", flujoSchema);
const Dinero = mongoose.model("Dinero", dineroSchema);

let dIn = null;
let dEnd= null;

//const fecha = new Date(2021, 06, 12);
//const primero = new Flujo({nombre: "Nuevos", valor: "0", fecha: fecha})

// const primerUsuario = new Usuario ({
//     nombre: 'Sebastian',
//     email: 'sebas.ing.civ.berrios@gmail.com',
//     password: '123456',
//     ingresos: [],
//     gastos: [],
//     activos: [],
//     pasivos: [],
//     ingresosMensuales: [],
//     gastosMensuales: []
// });
//
// primerUsuario.save();
// console.log(primerUsuario);

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
  let  sumActivo= 0;
  let sumPasivo = 0;
  let sumIngreso = 0;
  let sumGasto = 0;
  Usuario.findOne({email: userEmail}, function(err, foundUser){
    if (!err){
      foundUser.activos.forEach((activo) => {
        sumActivo = sumActivo + activo.dinero;
      });
      foundUser.pasivos.forEach((pasivo) => {
        sumPasivo = sumPasivo + pasivo.dinero;
      });
      foundUser.ingresos.forEach((ingreso) => {
        sumIngreso = sumIngreso + ingreso.cantidad;
      });
      foundUser.gastos.forEach((gasto) => {
        sumGasto = sumGasto + gasto.cantidad;
      });

      res.render("home", {activos: sumActivo, pasivos: sumPasivo, ingresos: sumIngreso, gastos: sumGasto,usuario: foundUser});
    }
  });

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
      dIn = dateIn;
      dEnd = dateEnd;
    res.redirect("/ingresos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);

  }
  });

app.post("/ingresos/pages", function(req, res){
    const page = req.body.button;
    const dateIn = dIn;
    const dateEnd = dEnd;
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
          dIn = null;
          dEnd = null;
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
                date.setDate(date.getDate() -1);
            }

            const gasto = new Flujo ({nombre: nIngreso, valor: cantidad, fecha: date});

            Usuario.findOne({email: userEmail}, function(err,found){
            if (!err){
                found.ingresos.push(gasto);
                found.save();
            }
            });
            res.redirect("/ingresos");
            });


//-----------INGRESOS------------------------
app.route('/activos')
.get(function(req, res){
const page = req.query.page || 1;
const dateIn = req.query.dateIn;
const dateEnd = req.query.dateEnd;
Usuario.findOne({email: userEmail}, function(err, foundUser){
    if(err){
        console.log(err);
    }else{
        if(dateIn != null && dateEnd != null){
          res.render("pages/activos", {
            pages: Math.ceil(foundUser.activos.length/perPage),
            current: page,
            dateIn: dateIn,
            dateEnd: dateEnd,
            listActivos: foundUser.activos.filter(activo => format.entreFechas(activo.fecha, dateIn, dateEnd)).slice(perPage * page - perPage , perPage * page )
            });
          }else{
            res.render("pages/activos", {
              pages: Math.ceil(foundUser.activos.length/perPage),
              current: page,
              dateIn: dateIn,
              dateEnd: dateEnd,
              listActivos: foundUser.activos.slice(perPage * page - perPage , perPage * page )});
            }
    }
});
})
.post(function(req, res){
  const page = req.query.page || 1;
  const dateIn = String(req.body.dateIn);
  const dateEnd = String(req.body.dateEnd);
  if(dateIn != null && dateEnd != null){
    dIn = dateIn;
    dEnd = dateEnd;
  res.redirect("/activos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);
}
});

app.post("/activos/pages", function(req, res){
  const page = req.body.button;
  const dateIn = dIn;
  const dateEnd = dEnd;
  let url = "/activos";
    url = url + "?page=" + page;
    if (dateIn != null && dateEnd != null){
      url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
    }
    res.redirect(url);

});
app.post("/activos/xFiltro", function(req, res){
        const page = 1;
        const dateIn = null;
        const dateEnd = null;
        dIn = null;
        dEnd = null;
        let url = "/activos";
          url = url + "?page=" + page;
          if (dateIn != null && dateEnd != null){
            url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
          }
          res.redirect(url);
      });

app.post("/activos/nActivo", function(req,res){

          const nActivo = req.body.nombreActivo;
          const cantidad = req.body.valorActivo;

          let date = new Date(req.body.fecha);
          //si la fecha viene vacía se ingresa la fecha de hoy
          if (req.body.fecha === ''){
              date = new Date();
              date.setDate(date.getDate() -1);
          }

          const activo = new Dinero ({nombre: nActivo, dinero: cantidad});

          Usuario.findOne({email: userEmail}, function(err,found){
          if (!err){
              found.activos.push(activo);
              found.save();
          }
          });
          res.redirect("/activos");
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
        dIn = dateIn;
        dEnd = dateEnd;
      res.redirect("/gastos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);

    }
    });

app.post("/gastos/pages", function(req, res){
  const page = req.body.button;
  const dateIn = dIn;
  const dateEnd = dEnd;
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
  dIn = null;
  dEnd = null;
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
        date = Date.now();
        date.setDate(date.getDate() -1);
    }

    const gasto = new Flujo ({nombre: nGasto, valor: cantidad, fecha: date});

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
