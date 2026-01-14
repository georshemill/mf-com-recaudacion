export class Deuda{
	tipoSaldo:number | 4 = 4; //poner 4 
    nroFacturacion:number | null = null;
    nroCuota:number| null = null;
    serieDoc:string | null = null;
    nroDoc:string | null = null;
    anio:string | null = null;
    mes:string | null = null;
    nombreMes:string | null = null;
    descripcion:string | null = null;
    flagEnReclamo:boolean | false = false; 
    fechaProrroga:string | null = null;
    impInicial:number | 0 = 0;
    impRebajado:number | 0 = 0;
    impCuenta:number | 0 = 0;
    impAgua:number | 0 = 0;
    impAlcantarillado:number | 0 = 0;
    impCargoFijo:number | 0 = 0;
    impInteres:number | 0 = 0;
    impOtrosConceptos:number | 0 = 0;
    impIGV:number | 0 = 0;
    redondeoAnterior:number | 0 = 0;
    redondeoActual:number | 0 = 0;
    impTotalMes:number| 0 = 0;
    flagNoFacturado:boolean | false = false;
    idConcepto:number| null = null;
    //PARA INSERTAR UN CONCEPTO
    impIgv:number| 0 = 0;
    impTotal:number| 0 = 0;
	baseImponible:number| 0 = 0;
    flagEditable:boolean | false = false;
    nuevo!:boolean
    
}