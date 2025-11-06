import { DetalleAnulacionPago } from "./DetalleAnulacionPago"

export class BusquedAnulacionPago{


	idEmpresa!:number 
	idSede!:number
	usuarioCreacion!:string
	fecha!:string
	nroPago: number | null = null;
	anulado!:number

	idCar!:number
	nroSuministro!:number
	impTotal!:number
	propietario!:string
	diaPago!:string
	items!:number
	detalleList:DetalleAnulacionPago[] = []
	

}





	
	
