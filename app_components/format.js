//jshint esversion:6
exports.formatearFecha = function (date){ 
    let dia = date.getDay()-1;
    let mes = date.getMonth()+1;
    let anio = date.getFullYear();

    if (dia < 10){
        dia = "0" + dia;
    }
    if (mes < 10){
        mes = "0" + mes;
    }
    return dia + "-" + mes + "-" + anio;
};