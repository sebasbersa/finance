//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");

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

app.use(session({
  secret: "finance-secret, real secret right.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

//MONGOOSE CONECTION
mongoose.connect("mongodb+srv://admin-sebastian:910nine99@cluster0.xevar.mongodb.net/financeDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
mongoose.set('useCreateIndex', true);

//SCHEMAS MONGOOSE
const flujoSchema = ({
    nombre: String,
    valor: Number,
    fecha: Date
});
const dineroSchema = ({
  nombre: String,
  valor: Number
});



const usuarioSchema = new mongoose.Schema({
    nombre: String,
    email: String,
    password: String,
    ingresos: [flujoSchema],
    ingresosMensuales: [dineroSchema],
    activos: [dineroSchema],
    gastos: [flujoSchema],
    pasivos: [dineroSchema],
    gastosMensuales: [dineroSchema]
});

usuarioSchema.plugin(passportLocalMongoose);

// //MODELS MONGOOSE
const Usuario = new mongoose.model("Usuario", usuarioSchema);

passport.use(Usuario.createStrategy());


passport.serializeUser(Usuario.serializeUser())
passport.deserializeUser(Usuario.deserializeUser())

const Flujo = mongoose.model("Flujo", flujoSchema);
const Dinero = mongoose.model("Dinero", dineroSchema);

let dIn = null;
let dEnd= null;

const thisDay = new Date();

app.use((req, res, next)=> {
  console.log(req.session);
  console.log(req.user);
  next();
});

const userEmail = 'sebas.ing.civ.berrios@gmail.com';

//const gastos = [];
// const gastoMensual = [];
// const gastoPasivo = []
// const ingresos = [];
// const ingresoMensual = [];
// const ingresoPasivo = []

//id:
// ingreso = 1
// gastos = 2
// ingresos mensuales = 3
// gastos mensuales = 4
// activos = 5
// pasivos = 6

//-------- const pagination tables
const perPage = 6;

//---------LOGIN AND REGISTER ---------------
app.get("/register", function(req, res){
  res.render("pages/register");
});

app.get("/login", function(req, res){
  res.render("pages/login");
});

app.post("/register", function(req, res){
Usuario.register({username: req.body.email}, req.body.password,function(err, user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }
  else{
    passport.authenticate("local")(req, res, function(){
      res.redirect("/");
    });
  }
});
});

app.post("/login", function(req, res){

});



//-----------HOME----------------------------
app.route('/')
.get(function(req, res){
  if(req.isAuthenticated()){
    let mes = req.query.mes || String(thisDay.getFullYear()) + "-" +String(thisDay.getMonth()+1);
    if(parseInt(thisDay.getMonth()) +1 < 10){
      mes = req.query.mes || String(thisDay.getFullYear()) + "-" + 0 + String(thisDay.getMonth()+1);
    }
    let sumIngresoMensual = 0;
    let sumGastoMensual = 0;
    let sumActivo= 0;
    let sumPasivo = 0;
    let sumIngreso = 0;
    let sumGasto = 0;
    let porcentajePasivos = 0;
    Usuario.findOne({email: userEmail}, function(err, foundUser){
      if (!err){
        foundUser.activos.forEach((activo) => {
          sumActivo = sumActivo + activo.valor;
        });
        foundUser.pasivos.forEach((pasivo) => {
          sumPasivo = sumPasivo + pasivo.valor;
        });
        foundUser.ingresos.forEach((ingreso) => {
          if(format.mismoMes(mes, ingreso.fecha)){sumIngreso = sumIngreso + ingreso.valor;};
        });
        foundUser.gastos.forEach((gasto) => {
          if(format.mismoMes(mes, gasto.fecha)){sumGasto = sumGasto + gasto.valor;};
        });
        foundUser.ingresosMensuales.forEach((ingresoMensual) => {
          sumIngresoMensual = sumIngresoMensual + ingresoMensual.valor;
        });
        foundUser.gastosMensuales.forEach((gastoMensual) => {
          sumGastoMensual = sumGastoMensual + gastoMensual.valor;
        });

        porcentajePasivos = (sumActivo - sumGastoMensual)/100;
        if(sumActivo-sumGastoMensual <0){
          porcentajePasivos = 0;
        }

        cashflow = sumIngresoMensual + sumIngreso + sumActivo - sumPasivo - sumGastoMensual - sumGasto;

        res.render("home", {
          activos: sumActivo,
          pasivos: sumPasivo,
          ingresos: sumIngreso,
          gastos: sumGasto,
          usuario: foundUser,
          mes: mes,
          ingresoMensual: sumIngresoMensual,
          gastoMensual: sumGastoMensual,
          pasivosMeta: porcentajePasivos,
          cashflow: cashflow
        });
      }
    });
  }
  else{
    res.redirect("/register");
  }

})
.post(function(req, res){
  let mes = req.body.fecha;
  let url = "/";
    url = url + "?mes=" + mes;
res.redirect(url)
});

//flujos
app.route('/ingresos')
  .get(function(req, res){
    const page = req.query.page || 1;
    const dateIn = req.query.dateIn;
    const dateEnd = req.query.dateEnd;
    dIn = dateIn;
    dEnd = dateEnd;
    const flujo = {id: 1, name: "Ingreso", tabla: "Ingresos", descripcion: "Ingresos esporádicos no contemplados mensualmente"}
    //res.render('pages/flujos', {flujo})
    Usuario.findOne({email: userEmail}, function(err, foundUser){
      if(!err){
          res.render("pages/flujos", {
            flujo,
            pages: Math.ceil(foundUser.ingresos.length/perPage),
            current: page,
            dateIn: dateIn,
            dateEnd: dateEnd,
            listFlujo: foundUser.ingresos.filter(ingreso => format.entreFechas(ingreso.fecha, dateIn, dateEnd)).slice(perPage * page - perPage , perPage * page)
          })
      }
    });
  });
app.route('/gastos')
  .get(function(req, res){
    const page = req.query.page || 1;
    const dateIn = req.query.dateIn;
    const dateEnd = req.query.dateEnd;
    dIn = dateIn;
    dEnd = dateEnd;
    const flujo = {id:2, name: "Gasto", tabla: "Gastos", descripcion: "Gastos esporádicos no contemplados mensualmente"}
    //res.render('pages/flujos', {flujo})
    Usuario.findOne({email: userEmail}, function(err, foundUser){
      if(!err){
          res.render("pages/flujos", {
            flujo,
            pages: Math.ceil(foundUser.gastos.length/perPage),
            current: page,
            dateIn: dateIn,
            dateEnd: dateEnd,
            listFlujo: foundUser.gastos.filter(gasto => format.entreFechas(gasto.fecha, dateIn, dateEnd)).slice(perPage * page - perPage , perPage * page)
          })
      }
    });
  });

app.route('/activos')
  .get(function(req, res){
  const page = req.query.page || 1;
  const dateIn = req.query.dateIn;
  const dateEnd = req.query.dateEnd;
  const flujo = {id: 5, name: "Activo", tabla: "Activos", descripcion: "Activos, inversiones que dejan dinero en tu bolsillo"}
  Usuario.findOne({email: userEmail}, function(err, foundUser){
      if(!err){
        res.render("pages/flujos", {
            flujo,
            pages: Math.ceil(foundUser.activos.length/perPage),
            current: page,
            dateIn: dateIn,
            dateEnd: dateEnd,
            listFlujo: foundUser.activos.slice(perPage * page - perPage , perPage * page )});
          }
        });
  });
app.route('/pasivos')
  .get(function(req, res){
    const page = req.query.page || 1;
    const dateIn = req.query.dateIn;
    const dateEnd = req.query.dateEnd;
    const flujo = {id: 6, name: "Pasivo", tabla: "Pasivos",descripcion: "Pasivos, objetos, deudas, todo aquello que quita dinero de tu bolsillo"}
    Usuario.findOne({email: userEmail}, function(err, foundUser){
        if(!err){
          res.render("pages/flujos", {
              flujo,
              pages: Math.ceil(foundUser.pasivos.length/perPage),
              current: page,
              dateIn: dateIn,
              dateEnd: dateEnd,
              listFlujo: foundUser.pasivos.slice(perPage * page - perPage , perPage * page )});
            }
          });
    });

app.route('/ingresomensual')
  .get(function(req, res){
  const page = req.query.page || 1;
  const dateIn = req.query.dateIn;
  const dateEnd = req.query.dateEnd;
  const flujo = {id: 3,name: "Ingreso Mensual", tabla: "Ingresos Mensuales", descripcion: "Ingresos mensuales que requieren de tu tiempo, como el trabajo"}
  Usuario.findOne({email: userEmail}, function(err, foundUser){
      if(!err){
        res.render("pages/flujos", {
            flujo,
            pages: Math.ceil(foundUser.ingresosMensuales.length/perPage),
            current: page,
            dateIn: dateIn,
            dateEnd: dateEnd,
            listFlujo: foundUser.ingresosMensuales.slice(perPage * page - perPage , perPage * page )});
          }
        });
  });

app.route('/gastomensual')
    .get(function(req, res){
    const page = req.query.page || 1;
    const dateIn = req.query.dateIn;
    const dateEnd = req.query.dateEnd;
    const flujo = {id: 4, name: "Gasto Mensual", tabla: "Gastos Mensuales", descripcion: "Gastos mensuales que no son parte de un patrimonio, como compras de mercadería"}
    Usuario.findOne({email: userEmail}, function(err, foundUser){
        if(!err){
          res.render("pages/flujos", {
              flujo,
              pages: Math.ceil(foundUser.gastosMensuales.length/perPage),
              current: page,
              dateIn: dateIn,
              dateEnd: dateEnd,
              listFlujo: foundUser.gastosMensuales.slice(perPage * page - perPage , perPage * page )});
            }
          });
    });

app.post('/flujos/nFlujo', function(req, res){
          const nFlujo = req.body.nombreFlujo;
          const cantidad = req.body.valorFlujo;
          let date = new Date(req.body.fecha);
          //si la fecha viene vacía se ingresa la fecha de hoy
          if (req.body.fecha === ''){
              date = new Date();
              date.setDate(date.getDate() -1);
          }
         const newDinero = new Dinero ({nombre: nFlujo, valor: cantidad});
         const newFlujo = new Flujo ({nombre: nFlujo, valor: cantidad, fecha: date});

          Usuario.findOne({email: userEmail}, function(err,found){
          if (!err){
            if(req.body.tipoFlujo === "1"){
              console.log("correcto");
              found.ingresos.push(newFlujo);
              found.save();
              res.redirect("/ingresos");
            }
            if(req.body.tipoFlujo === "2"){
              found.gastos.push(newFlujo);
              found.save();
              res.redirect("/gastos");
            }
            if(req.body.tipoFlujo === "5"){
              found.activos.push(newDinero);
              found.save();
              res.redirect("/activos");
            }
            if(req.body.tipoFlujo === "6"){
              found.pasivos.push(newDinero);
              found.save();
              res.redirect("/pasivos");
            }
            if(req.body.tipoFlujo === "3"){
              found.ingresosMensuales.push(newDinero);
              found.save();
              res.redirect("/ingresomensual");
            }
            if(req.body.tipoFlujo === "4"){
              found.gastosMensuales.push(newDinero);
              found.save();
              res.redirect("/gastomensual");
            }
          }
          });
        });

app.route('/flujos/delete')
  .post(function(req, res){
          const elemento = req.body;
          if(req.body.tipoFlujo === "1"){
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
        }
        if(req.body.tipoFlujo==="2"){
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
      }

      if(req.body.tipoFlujo==="5"){
        Usuario.updateOne(
            { email: userEmail },
            { $pull: { activos: { _id: elemento.id } } },
            { multi: false },function(err){
                if(err){
                    console.log(err);
                }
            }
          );
        res.redirect("/activos");
    }
    if(req.body.tipoFlujo==="6"){
      Usuario.updateOne(
          { email: userEmail },
          { $pull: { pasivos: { _id: elemento.id } } },
          { multi: false },function(err){
              if(err){
                  console.log(err);
              }
          }
        );
      res.redirect("/pasivos");
  }
  if(req.body.tipoFlujo==="3"){
    Usuario.updateOne(
        { email: userEmail },
        { $pull: { ingresosMensuales: { _id: elemento.id } } },
        { multi: false },function(err){
            if(err){
                console.log(err);
            }
        }
      );
    res.redirect("/ingresomensual");
  }
  if(req.body.tipoFlujo==="4"){
    Usuario.updateOne(
        { email: userEmail },
        { $pull: { gastosMensuales: { _id: elemento.id } } },
        { multi: false },function(err){
            if(err){
                console.log(err);
            }
        }
      );
    res.redirect("/gastomensual");
  }
      })

app.post('/flujos/filtros', function(req, res){
    const page = req.query.page || 1;
    const dateIn = String(req.body.dateIn);
    const dateEnd = String(req.body.dateEnd);

    if(dateIn != null && dateEnd != null){
      dIn = dateIn;
      dEnd = dateEnd;
      if(req.body.tipoFlujo === "1"){
        res.redirect("/ingresos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);
      }
      if(req.body.tipoFlujo === "2"){
        res.redirect("/gastos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);
      }
      if(req.body.tipoFlujo === "5"){
        res.redirect("/activos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);
      }
      if(req.body.tipoFlujo === "6"){
        res.redirect("/pasivos?dateIn=" + dateIn + "&dateEnd=" + dateEnd);
      }
      if(req.body.tipoFlujo === "3"){
        res.redirect("/ingresomensual?dateIn=" + dateIn + "&dateEnd=" + dateEnd);
      }
      if(req.body.tipoFlujo === "4"){
        res.redirect("/gastomensual?dateIn=" + dateIn + "&dateEnd=" + dateEnd);
      }
  }
  });

app.post("/flujos/xFiltro", function(req, res){
    const page = 1;
    const dateIn = null;
    const dateEnd = null;
    dIn = null;
    dEnd = null;
    let url = "";
    if(req.body.tipoFlujo === "1"){
      url = "/ingresos";
    }
    if(req.body.tipoFlujo === "2"){
      url = "/gastos";
    }
    if(req.body.tipoFlujo === "5"){
      url = "/activos";
    }
    if(req.body.tipoFlujo === "6"){
      url = "/pasivos";
    }
    if(req.body.tipoFlujo === "3"){
      url = "/ingresomensual";
    }
    if(req.body.tipoFlujo === "4"){
      url = "/gastomensual";
    }
      url = url + "?page=" + page;
      if (dateIn != null && dateEnd != null){
        url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
      }
      res.redirect(url);
  });

app.post("/flujos/pages", function(req, res){
    const page = req.body.button;
    const dateIn = dIn;
    const dateEnd = dEnd;
    let url = "";
    if(req.body.tipoFlujo === "1"){
      url = "/ingresos";
    }
    if(req.body.tipoFlujo === "2"){
      url = "/gastos";
    }
    if(req.body.tipoFlujo === "5"){
      url = "/activos";
    }
    if(req.body.tipoFlujo === "6"){
      url = "/pasivos";
    }
    if(req.body.tipoFlujo === "3"){
      url = "/ingresomensual";
    }
    if(req.body.tipoFlujo === "4"){
      url = "/gastomensual";
    }
      url = url + "?page=" + page;
      if (dateIn != null && dateEnd != null){
        url = url + "&dateIn=" + String(dateIn) + "&dateEnd=" + String(dateEnd);
      }
      res.redirect(url);
  });

app.post("/agregarMes", function(req, res){
  console.log("it works!");
});




//inicializacion del puerto
app.listen(process.env.PORT || 3000, function(){
    console.log("se escucha el puerto 3.000");
  });
