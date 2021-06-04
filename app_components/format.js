//jshint esversion:6
exports.formatearFecha = function (fecha){ 
    let dia = fecha.getDay()-1;
    let mes = fecha.getMonth()+1;
    let anio = fecha.getFullYear();

    if (dia < 10){
        dia = "0" + dia;
    }
    if (mes < 10){
        mes = "0" + mes;
    }
    return dia + "-" + mes + "-" + anio;
};