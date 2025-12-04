import { UnidadesUsoCatastro } from "./UnidadesUsoCatastro";

export class GestionCuadre{

	idEmpresa: number =1;
	idSede: number | null = null;
	usuarioCreacion: string | null = null;
	
	//ULTIMO
	idSedeBsq!:number
	fechaDpl: string | null = null;
	fecha: string | null = null;
	idCar!:number

	//MODEL POR BUSQUEDA X TIPO
	idTipoDeuda!:number
	importe!:number
    cantidad!:number
    tipoDeuda!: string //| null = null;
	
	//MODEL POR BUSQUEDA X SEDE
	impTotal!:number
    nroTransacciones!:number
    anulado!:number
    nombreSede!:string

	//MODEL POR BUSQUEDA X FORMA
	idFormaPago!:number
    formaPago!:string

	//MODEL POR BUSQUEDA X COMPROBANTE
    tipoComprobante!:string
    idTipoComprobante!:number
    serieDoc!:string

	
}