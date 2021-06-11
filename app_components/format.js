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
  let dia = parseInt(fecha.slice(0, 2));
  let month = parseInt(fecha.slice(3,5));
  let year = parseInt(fecha.slice(6,10));

  let diaIn = parseInt(dateIn.slice(8,10));
  let monthIn = parseInt(dateIn.slice(6,8));
  let yearIn = parseInt(dateIn.slice(0,5));

  let diaEnd = parseInt(dateEnd.slice(8,10));
  let monthEnd = parseInt(dateEnd.slice(6,8));
  let yearEnd = parseInt(dateEnd.slice(0,5));



  if(compararFechas(dia,month,year,diaIn,monthIn,yearIn) && compararFechas(diaEnd, monthEnd, yearEnd, dia,month,year)){
    return true;
  }else{
    return false;
  }
};


function compararFechas(diaM, mesM, yearM, dia, mes, year){
  //cumpleanos = new Date(1995,11,17);
  let fechaMayor = new Date(yearM, mesM, diaM);
  let fechaMenor = new Date(year, mes, dia);

  if(fechaMayor >= fechaMenor){
    return true;
  }else{
    return false;
  }






}
