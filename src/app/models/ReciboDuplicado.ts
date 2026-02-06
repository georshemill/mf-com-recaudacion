import { Sector } from "./Sector";
import { Tarifas } from "./Tarifas";

export class ReciboDuplicado{
	idEmpresa!:number 
	nroSuministro!:number
    anio:string | null = null;
    mes:string | null = null;
	usuarioCreacion:string| null = null;

    idCiclo!:number 
    idSede!:number 
    idSucursal!:number 
	tarifaList:Tarifas[] = []
	/*private List<Sector> SectorList;   
    private List<TipoServicio> TipoServicioList;   
    private List<TipoEstServicio> EstadoServicioList; 
    /*private List<TarifasPadron> TarifaList;    
    private List<TipoUsuario> TipoUsuarioList; */   
    idOrdenamiento!:number 
    idTipoReporte!:number 
    
    //PARAMETROS SALIDA 
    item!:number 
    idSector!:string
    ruta!:string
    orden!:string
    tipoServicio!:string
    codigoAlternativo!:string
    nroMedidor!:string
    nroDocIdentidad!:string
    propietario!:string
    idEstadoServicio!:string
    estadoServicio!:string
    direccion2!:string
    nroCalle!:string
    nroInterior!:string
    tarifa!:string
    idTipoUsuario!:string

	
        
}
