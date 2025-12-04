import { DetalleAnulacionPago } from "./DetalleAnulacionPago"
import { DetalleCuadrexImporte } from "./DetalleCuadrexImporte"

export class CuadrexImporte{

	idEmpresa!:number
	idSede!:number
	fecha!: string //| null = null;
	idCar!:number
	usuarioCreacion!: string


	impTotal!:number
	nroTransacciones!:number
	impCobrado!:number

	detallePagos:DetalleCuadrexImporte[] = []
	

}





	
	
