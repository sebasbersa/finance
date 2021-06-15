//jshint esversion:6
exports.formatearFecha = function (fecha){
    let dia = parseInt(fecha.getDate());
    let mes = parseInt(fecha.getMonth())+1;
    let anio = parseInt(fecha.getFullYear());

    if (dia < 10){
        dia = "0" + dia;
    }
    if (mes < 10){
        mes = "0" + mes;
    }
    return dia + "-" + mes + "-" + anio;
};

exports.entreFechas = function(fecha, dateIn, dateEnd){
  let fechaReal = fecha;

  let diaIn = parseInt(dateIn.slice(8,10));
  let monthIn = parseInt(dateIn.slice(6,8));
  let yearIn = parseInt(dateIn.slice(0,5));

  fechaIn = new Date(yearIn,monthIn,diaIn);

  let diaEnd = parseInt(dateEnd.slice(8,10));
  let monthEnd = parseInt(dateEnd.slice(6,8));
  let yearEnd = parseInt(dateEnd.slice(0,5));
  fechaEnd = new Date(yearEnd,monthEnd,diaEnd);

  if(compararFechas(fechaReal,fechaIn) && compararFechas(fechaEnd,fechaReal)){
    return true;
  }else{
    return false;
  }
};


function compararFechas(fechaMay, fechaMen){
  //cumpleanos = new Date(1995,11,17);
  let fechaMayor = fechaMay;
  let fechaMenor = fechaMen;

  if(fechaMayor >= fechaMenor){
    return true;
  }else{
    return false;
  }
};

exports.mismoMes = function mismoMes(mes, fecha){
  let hoy = new Date();
  if(mes!=1){
    let year = parseInt(mes.slice(0,5));
    let month = parseInt(mes.slice(5,7))-1;
    hoy = new Date(year,month,1);
  }
  if (fecha.getFullYear() === hoy.getFullYear() && fecha.getMonth() === hoy.getMonth()){
    return true;
  }else{
    return false;
  };
}
