import { Component, OnInit } from '@angular/core';
import { ParametrosModule } from '../parametros.module';
import { FuncionesService } from '../../services/funciones.service';
import { ComercializacionService } from '../../services/Recaudacion.service';
import { Localidad } from '../../models/Localidad';
import { PanelBusquedaComponent } from '../../shared/panel-busqueda/panel-busqueda.component';
import { TipoDocumento } from '../../models/TipoDocumento';
import { Table } from 'primeng/table';
import { Calles } from '../../models/Calles';
import { Urbanizacion } from '../../models/Urbanizacion';
import { Distrito } from '../../models/Distrito';
import { Provincia } from '../../models/Provincia';
import { TipoServicio } from '../../models/TipoServicio';
import { TipoDiametros } from '../../models/TipoDiametros';
import { TipoEstadoPredio } from '../../models/TipoEstadoPredio';
import { TipoSolicitud } from '../../models/TipoSolicitud';
import { TipoConexion } from '../../models/TipoConexion';
import { Solicitud } from '../../models/solicitud-conexion/Solicitud';
import { Sector } from '../../models/Sector';
import { Manzanas } from '../../models/Manzanas';
import { Sede } from '../../models/Sede';

type IntBooleanKeys<T> = {
  [K in keyof T]: T[K] extends 0 | 1 ? K : never
}[keyof T];

@Component({
  selector: 'app-solicitud-conexion',
  imports: [ParametrosModule,PanelBusquedaComponent],
  templateUrl: './solicitud-conexion.component.html',
  styleUrl: './solicitud-conexion.component.scss',
  providers: [ComercializacionService]
})
export class SolicitudConexionComponent implements OnInit{

  dialogForm:boolean=false
  dialogCalle:boolean=false
  dialogUrba:boolean=false
  dialogCalleNoti:boolean=false
  dialogUrbaNoti:boolean=false
  maximized = false;
  _provincia:Provincia[] = []
  _localidad:Localidad[] = []
  _sede:Sede[] = []
  _sector:Sector[] = []
  _distrito:Distrito[] = []
  _tipoDocumento:TipoDocumento[] = []
  _calles:Calles[] = []
  _urbanizacion:Urbanizacion[] = []
  _tipoServicio:TipoServicio[] = []
  _tipoDiametrosAgu:TipoDiametros[] = []
  _tipoDiametrosAlcan:TipoDiametros[] = []
  _tipoEstadoPredio:TipoEstadoPredio[] = []
  _tipoSolicitud:TipoSolicitud[] = []
  _tipoConexion:TipoConexion[] = []
  _manzanas:Manzanas[] = []
  /*nrodocumento: string | null = null;
  nrosolicitud: string| null = null;
  propietario: string| null = null;
  nrosuministro: string| null = null;
  parametro: string| null = null;*/




  _gestionSolicitudModel:Solicitud=new Solicitud
  _gestionSolicitud:Solicitud[] = []
  

  descripcionDireccion: string | null = null;
  descripcionUrba: string | null = null;
  descripcionDireccionNoti: string | null = null;
  descripcionUrbaNoti: string | null = null;


  
  tabs = [
    { title: 'Solicitud Conexion', value: "0", icon: 'pi pi-home'},
    { title: 'Reportes', value: "1", icon: 'pi pi-user-edit' },
  ]
  activeAccordionIndex: number[] = [0];
  accordions = {
    ruta_distribucion: [0],
    distribucion_recibo: [0],
    actualizacion_catastral: [0],
    direccion: [0],
    solicitante: [0],
  }; 

  constructor(private comercializacionService:ComercializacionService,
    private funcionesService:FuncionesService,
  ) 
  {}


  ngOnInit(): void {
    
    this.init()
    
  
  }

  init(){
    this.comercializacionService.dropdownLocalidad().subscribe((respuesta) => {
      this._localidad=respuesta.data
    })

    this.comercializacionService.dropdownTipodocumento().subscribe((respuesta) => {
      this._tipoDocumento=respuesta.data
    })

    this.comercializacionService.dropdownTipoServicio().subscribe((respuesta) => {
      this._tipoServicio=respuesta.data
    })

    this.comercializacionService.dropdownDiametros(1).subscribe((respuesta) => {
      this._tipoDiametrosAgu=respuesta.data
    })

    this.comercializacionService.dropdownDiametros(2).subscribe((respuesta) => {
      this._tipoDiametrosAlcan=respuesta.data
    })

    this.comercializacionService.dropdownTipoEstadoPredio().subscribe((respuesta) => {
      this._tipoEstadoPredio=respuesta.data
    })
    
    this.comercializacionService.dropdownTipoSolicitudConexion().subscribe((respuesta) => {
      this._tipoSolicitud=respuesta.data
    })

    this.comercializacionService.dropdownTipoUsoConexion().subscribe((respuesta) => {
      this._tipoConexion=respuesta.data
    })

    this.comercializacionService.dropdownSede().subscribe((respuesta) => {
      this._sede=respuesta.data
    })

    this._gestionSolicitudModel.idEmpresa=1
    this._gestionSolicitudModel.idSedeBsq=1

    this.comercializacionService.BusquedaSolicitudConex(this._gestionSolicitudModel).subscribe({
      next: (data) => {
        if (data.data.length != 0) {
          this._gestionSolicitud = data.data;
        } else {
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._gestionSolicitud = [];
        }
      },
    }); 


    
    

    this._gestionSolicitudModel.idTipoDocIdentidad ="01"
    this._gestionSolicitudModel.idTipoServicio =1
    
    



  }


  //FUNCIONES DIALOG PERSONALIZADO
  toggleMaximize() {
    this.maximized = !this.maximized;
  }

  get dialogStyle() {
    return this.maximized
    ? {} : { width: '1400px', height: '900px' };
  }

  fixDialogPosition() {
    setTimeout(() => {
      const el = document.querySelector('.p-dialog.dialog-maximized') as HTMLElement;
      if (el) {
        el.style.top = '0';
        el.style.left = '0';
        el.style.right = '0';
        el.style.bottom = '0';
        el.style.transform = 'none';
        el.style.height = '100vh';
        el.style.width = '100vw';
      }
    }, 0);
  }

  ModalClose(){

    this.funcionesService.popupConfirmacion("Anulacion","Desea Anular el Registro?","Aceptar").then((result)=>{
      if(result.isConfirmed){
        this.dialogForm=false
        /*this.descripcionDireccion=null
        this.descripcionUrba=null        
        Object.assign(this._gestionCatastroModel, this._gestionCatastroModelClean);*/
      }
    })
  }

  Busqueda(){

    if(!this._gestionSolicitudModel.nrosolicitudBsq?.toString().trim() &&!this._gestionSolicitudModel.nrodocumentoBsq?.toString().trim()&&
       !this._gestionSolicitudModel.nrosuministroBsq?.toString().trim() && !this._gestionSolicitudModel.propietarioBsq?.toString().trim()){

      this.funcionesService.popupError("Ingrese Campo de Busqueda","");
    }

    this.comercializacionService.BusquedaSolicitudConex(this._gestionSolicitudModel).subscribe({

      next: (data) => {
        if (data.data.length != 0) {
          this._gestionSolicitud = data.data;
          //this.blockTablePersona = 1;
        } else {
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._gestionSolicitud = [];
          this._gestionSolicitudModel.nrosolicitudBsq=null
          this._gestionSolicitudModel.nrodocumentoBsq=null
          this._gestionSolicitudModel.nrosuministroBsq=null
          this._gestionSolicitudModel.propietarioBsq=null
          
        }
      },
      error: (err) => {
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._gestionSolicitud = [];
        this._gestionSolicitudModel.nrosolicitudBsq=null
        this._gestionSolicitudModel.nrodocumentoBsq=null
        this._gestionSolicitudModel.nrosuministroBsq=null
        this._gestionSolicitudModel.propietarioBsq=null
      }
    }); 
    

  }

  setCheckboxValue(prop: IntBooleanKeys<Solicitud>, checked: boolean): void {
        this._gestionSolicitudModel[prop] = checked ? 1 : 0;
  
        if(this._gestionSolicitudModel.flagRepresentante===0){
          this._gestionSolicitudModel.nombreRepresentante=""
          this._gestionSolicitudModel.nroDocIdentidadRepresentante=""
          this._gestionSolicitudModel.direccionRepresentante=""
          this._gestionSolicitudModel.nroCalleRepresentante=""
          this._gestionSolicitudModel.mzaMunicipalRepresentante=""
          this._gestionSolicitudModel.loteMunicipalRepresentante=""
          this._gestionSolicitudModel.urbanizacionRepresentante=""
          this._gestionSolicitudModel.idProvinciaRepresentante=null
          this._gestionSolicitudModel.idDistritoRepresentante=null
          this._gestionSolicitudModel.nroParteRegistral=""
        }

        if(this._gestionSolicitudModel.flagConexionTemporal===0){
          this._gestionSolicitudModel.nroMesesTemporal=null
        }

        if(this._gestionSolicitudModel.flagNotificaciones===0){
          this.descripcionDireccionNoti=""
          this._gestionSolicitudModel.nroCalleCorrespondencia=""
          this._gestionSolicitudModel.mzaCorrespondencia=""
          this._gestionSolicitudModel.nroLoteCorrespondencia=""
          this.descripcionUrbaNoti=""
          this._gestionSolicitudModel.idProvinciaCorrespondencia=null
          this._gestionSolicitudModel.idDistritoCorrespondencia=null
          this._gestionSolicitudModel.idUrbanizacionCorrespondencia=null
          this._gestionSolicitudModel.idCalleCorrespondencia=null
        }
  }

  changeProvincia(idepartamento:any){
    this.comercializacionService.dropdownProvincia(idepartamento).subscribe((respuesta) => {
      this._provincia=respuesta.data
    })
  }

  changeDistrito(valor:any){
    this.comercializacionService.dropdownDistrito(this._gestionSolicitudModel.idDepartamento!,valor).subscribe((respuesta) => {
      this._distrito=respuesta.data
    })
  }

  changeLocalidad(x:any){
    
    console.log(x)

    this._gestionSolicitudModel.idSucursal =x.idSucursal   

    this.comercializacionService.dropdownProvincia(x.idDepartamento).subscribe((respuesta) => {
      this._provincia=respuesta.data
    })

    this.comercializacionService.dropdownDistrito(x.idDepartamento!,x.idProvincia).subscribe((respuesta) => {
      this._distrito=respuesta.data
    })

    this.comercializacionService.dropdownSecxLocalidad(x.idSucursal).subscribe((respuesta) => {
      this._sector=respuesta.data
    })

    this.comercializacionService.dropdownCallexLoc(x.idSucursal).subscribe((respuesta) => {
      this._calles=respuesta.data
    })

    this.comercializacionService.dropdownUrbaxLoc(x.idSucursal).subscribe((respuesta) => {
      this._urbanizacion=respuesta.data
    })


  }

  changeSector(x:any){
 
    this.comercializacionService.dropdownManzanas(this._gestionSolicitudModel.idSucursal,x).subscribe((respuesta) => {
      this._manzanas=respuesta.data
    })
  }

  recibirBusqueda(x: any) {
     this._gestionSolicitudModel.apellidos=x.apellidos
     this._gestionSolicitudModel.nombres=x.nombres
     this._gestionSolicitudModel.idTipoDocIdentidad=x.idTipoDocIdentidad
     this._gestionSolicitudModel.nroDocIdentidad=x.nroDocIdentidad

  }

  onSelectDoc(x: string) {

    if (x === '01' || x!=='06') {

      this._gestionSolicitudModel.idTipoDocIdentidad ==='01'
      this._gestionSolicitudModel.razonSocial=""
      this._gestionSolicitudModel.nroDocIdentidad=""

    }else{

      this._gestionSolicitudModel.idTipoDocIdentidad ==='06'
      this._gestionSolicitudModel.nroDocIdentidad=""
      this._gestionSolicitudModel.nombres=""
      this._gestionSolicitudModel.apellidos=""

    }
  }

  onSelectServicio(x: number){
    
    if (x=2) {

      this._gestionSolicitudModel.idDiametroAgua =null

    }

    if (x =3) {

      this._gestionSolicitudModel.idDiametroDesague =null

    }

   
      


  }

  onRowSelectDireccion(x:any){
    this.descripcionDireccion=x.data.descripcion
    this._gestionSolicitudModel.idCalle=x.data.idCalle
    this.dialogCalle=false
  }

  onRowSelectUrba(x:any){
    this.descripcionUrba=x.data.descripcion
    this._gestionSolicitudModel.idUrbanizacion=x.data.idUrbanizacion
    this.dialogUrba=false
  }

  onRowSelectDireccionNoti(x:any){
    this.descripcionDireccionNoti=x.data.descripcion
    this._gestionSolicitudModel.idCalleCorrespondencia=x.data.idCalle
    this.dialogCalleNoti=false
  }

  onRowSelectUrbaNoti(x:any){
    this.descripcionUrbaNoti=x.data.descripcion
    this._gestionSolicitudModel.idUrbanizacionCorrespondencia=x.data.idUrbanizacion
    this.dialogUrbaNoti=false
  }

  gestionar(){

    this.comercializacionService.crudSolicitud(this._gestionSolicitudModel, 1).subscribe((respuesta) => {
      //this.dialogForm=false
        /*if(respuesta.success==true){
          this.funcionesService.popupExito("Confirmacion","El Registro se Modifico Correctamente");
          this.messageService.add({severity: 'success',summary: 'Confirmacion',detail: 'Registro Actualizado',life: 3000});
          this.listar()
        }else {
          this.funcionesService.popupError("Aviso de Usuario","Ocurrio un Error al Actualizar los Datos");
        }*/
    })

  }


  nuevo(){
    //this.new=1
    console.log(this._gestionSolicitudModel.idTipoDocIdentidad)
    
    this.dialogForm=true
  }

  //PROPIEDADES TABLAS

  toggleOptions(event: Event, opt: HTMLElement, date: HTMLElement) {
    if (event.type === 'mouseenter') {
        opt.style.display = 'flex';
        date.style.display = 'none';
    } else {
        opt.style.display = 'none';
        date.style.display = 'flex';
    }
  }

  onGlobalFilterCalle(tableCalle: Table, event: Event) {
      tableCalle.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onGlobalFilterUrba(tableUrba: Table, event: Event) {
    tableUrba.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

}
