export class Colateral{
	idEmpresa!:number 
	idSede!:number
	idSedeOperacional!:number 
	unidadMedida !:string
	flagInafecto !:string
	flagEditable !:string
	descripcion !:string
	baseImponible!:number
	idConcepto!:number 
	
	usuarioCreacion!:string
	fechaRegistro!:string
	estado!:boolean 
}

/*

"idSedeOperacional": 1,
            "unidadMedida": "UND",
            "flagInafecto": "0",
            "flagEditable": "0",
            "descripcion": "CONEXIÓN AGUA",
            "baseImponible": "100.00",
            "idConcepto": 1
*/