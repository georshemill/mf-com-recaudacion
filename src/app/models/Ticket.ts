import { DetalleAnulacionPago } from "./DetalleAnulacionPago";
import { Deuda } from "./Deuda";
import { UnidadesUsoCatastro } from "./UnidadesUsoCatastro";

export class Ticket{

	idEmpresa: number | null = null;
	idSede: number | null = null;
	nombre: string | null = null;
    ruc: string | null = null;     
    nombresede: string | null = null; 
    idCar: number | null = null;
    nroPago: number | null = null;
    nroSuministro: string | null = null;
    codigoCatastral: string | null = null;
    diaPago: string | null = null;     
    fpago: string | null = null;       
    horapago: string | null = null;   
    propietario: string | null = null; 
    direccion: string | null = null;      
    baseImponible: number | null = null;
    impIgv: number | null = null;         
    impTotal: number | null = null;     
    impEfectivo: number | null = null;  
    vuelto: number | null = null;  
    usuarioCreacion: string | null = null;
    items: string | null = null;        
    anulado: string | null = null;    
    fimpres: string | null = null;      
    horaimpres: string | null = null;   
	detalleTicket:DetalleAnulacionPago[] = []
	
}
