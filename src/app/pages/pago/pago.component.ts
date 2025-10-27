import { Component, OnInit, ViewChild } from '@angular/core';
import { ParametrosModule } from '../parametros.module';
import { RecaudacionService } from '../../services/Recaudacion.service';
import { FuncionesService } from '../../services/funciones.service';
import { Colateral } from '../../models/Colateral';
import { OrdenPago } from '../../models/OrdenPago';
import { PanelBusquedaComponent } from '../../shared/panel-busqueda/panel-busqueda.component';
import { Deuda } from '../../models/Deuda';
import { Comprobante } from '../../models/Comprobante';
import { SerieComprobante } from '../../models/SerieComprobante';
import { Table } from 'primeng/table';
import { Personas } from '../../models/Personas';
import { MessageService } from 'primeng/api';
import { BusquedaOrdenPago } from '../../models/BusquedaOrdenPago';
import { FiltroCliente } from '../../models/FiltroCliente';
import { Localidad } from '../../models/Localidad';
import { TipoFormaPago } from '../../models/TipoFormaPago';



type IntBooleanKeys<T> = {
  [K in keyof T]: T[K] extends 0 | 1 ? K : never
}[keyof T];

@Component({
  selector: 'app-pago',
  imports: [ParametrosModule,PanelBusquedaComponent],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.scss',
  providers: [RecaudacionService]
})
export class PagoComponent implements OnInit{
  @ViewChild(PanelBusquedaComponent) panelBusqueda!: PanelBusquedaComponent;
  _blockPrincipal:number=0
  dialogColateral:boolean=false
  dialogOrden:boolean=false
  dialogEventual:boolean=false
  dialogCliente:boolean=false
  _colateral:Colateral[] = []
  _comprobante:Comprobante[] = []
  _serieComprobante:SerieComprobante[] = []
  _formaPago:TipoFormaPago[] = []
  _ordenPagoModel:OrdenPago=new OrdenPago
  _deudaList:Deuda[] = []
  totalMonto: number = 0;
  _personas:Personas[] = []
  blockTable:number=0
  nrodocumento: string=""
  datos: string=""
  campo: string=""
  parametro: string=""
  searchSede!:number
  searchEmp!:number
  _listBusquedaPago:BusquedaOrdenPago[] = []
  _modalFiltro:OrdenPago=new OrdenPago
  _filtroCliente:FiltroCliente[] = []
  _modalFiltroCliente:FiltroCliente=new FiltroCliente
  blockLocalidad:number=0
  _localidad:Localidad[] = []




   constructor(private recaudacionService:RecaudacionService,
              private funcionesService:FuncionesService,
              private messageService: MessageService
    ) 
    {}

  ngOnInit(): void {
    this.init()
  }

  

  init(){
    this.recaudacionService.ListColateral({idEmpresa:1,idSede:1}).subscribe((respuesta) => {
      this._colateral=respuesta.data
    })

    this.recaudacionService.dropdownComprobante().subscribe((respuesta) => {
      this._comprobante=respuesta.data
    })


    this.recaudacionService.ListDeudaPagos({idEmpresa:1,idSede:1}).subscribe((respuesta) => {
      this._listBusquedaPago=respuesta.data
    })

    this.recaudacionService.dropdownTipoFormaPago().subscribe((respuesta) => {
      this._formaPago=respuesta.data
    })


    


    

  }


  recibirBusqueda(x: any) {

    this.searchSede=x.idSede
    this.searchEmp=1

    if(x.nroSuministro>0){
      this._ordenPagoModel.idSede=x.idSede
      this._ordenPagoModel.idEmpresa=1
      this._ordenPagoModel.nroSuministro=x.nroSuministro
    }else{
      this._blockPrincipal=0
    }

    this.recaudacionService.ConsultaOrdenPago(this._ordenPagoModel).subscribe({
      next: (data) => {
        if (data.data != null) {
            this._ordenPagoModel = data.data;
            this._deudaList= data.data.deudaList
            this._blockPrincipal=1
            this._ordenPagoModel.idPersona=null
            this.calcularTotal()
            
        } else {
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._blockPrincipal=0
        }
      },
      error: (err) => {
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._blockPrincipal=0
      }
    });
  }


  BusquedaOrdenDirecta(){

    this._modalFiltro.idEmpresa=1
    this._modalFiltro.idSede=1

    this.recaudacionService.ConsultaDeudaPago(this._modalFiltro).subscribe({
          next: (data) => {
            if (data.data != null) {
              this._ordenPagoModel = data.data;
              this._deudaList= data.data.deudaList
              this._blockPrincipal=1
              this._ordenPagoModel.idPersona=null
              this.calcularTotal()

              if(this._ordenPagoModel.mensaje!=null){
                this.funcionesService.popupAlerta(this._ordenPagoModel.mensaje);
              }
            } else {
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._blockPrincipal=0
            }
          },
          error: (err) => {
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._blockPrincipal=0
          }
        }); 
  }


  onRowSelectOrden(x:any){

    this._modalFiltro.idEmpresa=x.idEmpresa
    this._modalFiltro.idSede=x.idSede
    this._modalFiltro.nroSuministro=x.nroSuministro

    this.recaudacionService.ConsultaDeudaPago(this._modalFiltro).subscribe({
          next: (data) => {
            if (data.data != null) {
              this._ordenPagoModel = data.data;
              this._deudaList= data.data.deudaList
              this._blockPrincipal=1
              this._ordenPagoModel.idPersona=null
              this.calcularTotal()
              this.dialogOrden=false

              if(this._ordenPagoModel.mensaje!=null){
                this.funcionesService.popupAlerta(this._ordenPagoModel.mensaje);
              }
            } else {
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._blockPrincipal=0
              this.dialogOrden=false
            }
          },
          error: (err) => {
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._blockPrincipal=0
            this.dialogOrden=false
          }
        }); 

  }

   setCheckboxValue(prop: IntBooleanKeys<OrdenPago>, checked: boolean): void {
        this._ordenPagoModel[prop] = checked ? 1 : 0;
  
        if(this._ordenPagoModel.flagEventual===0){
          //this.panelBusqueda.limpiar(); ver 
          this.blockTable=0
          this._personas = [];
          this.nrodocumento=""
          this.datos=""
          /*this.resetar_Cate()
          this._porcentajeCategorizacion=0
          this._fechainiactividadesCategorizacion=""
          this._tarifasModelCategorizacion= null;
          this._tipoactividadModelCategorizacion= null;*/
        }else{
          //this.panelBusqueda.limpiar();
          this.dialogEventual=true
        }
      }
  
  changeComprobante(x:any){

    this.recaudacionService.dropdownSerieComprobante(x).subscribe((respuesta) => {
      this._serieComprobante=respuesta.data
    })

  }

  onRowSelect(x:any){
    let deuda = new Deuda;
    /*deuda.descripcion = x.data.descripcion
    deuda.impTotalMes = x.data.baseImponible
    deuda.flagEnReclamo = false     CON SELECT A LATABLA
    deuda.flagNoFacturado = false*/
    deuda.descripcion = x.descripcion
    deuda.impTotalMes = x.baseImponible
    deuda.idConcepto =x.idConcepto
    deuda.flagEnReclamo = false
    deuda.flagNoFacturado = false
    this._deudaList = this._deudaList ?? [];
    this._deudaList.push(deuda)
    this.calcularTotal()
  }


  removeCate(idx:any){
    this._deudaList.splice(idx,1);
    this.calcularTotal()
  } 

  calcularTotal() {
    //this.totalMonto = this._deudaList.reduce((acc, item) => acc + item.impTotalMes, 0); LOQ UE TENIA INCIAL
    this.totalMonto = (this._deudaList ?? []).reduce((acc, item) => acc + (item.impTotalMes || 0),0);
  }

  colateral(){
    this.dialogColateral=true

  }

  BusquedaPersona(){
    if(this.nrodocumento==undefined ||this.nrodocumento==""){
      this.campo="NombreCompleto"
      this.parametro=this.datos
    }else{
      this.campo="nroDocIdentidad"
      this.parametro=this.nrodocumento
    }

    this.recaudacionService.listarPersonas(this.campo, this.parametro).subscribe({
      next: (data) => {
        if (data.data.length != 0) {
          this._personas = data.data;
          //this.nrodocumento = "";
          //this.datos = "";
          this.blockTable = 1;
        } else {
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._personas = [];
          this.blockTable = 0;
          this.nrodocumento = "";
          this.datos = "";
        }
      },
      error: (err) => {
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._personas = [];
        this.blockTable = 0;
        this.nrodocumento = "";
        this.datos = "";
      }
    });

  }

  onRowSelectPersona(x:any){
    this._ordenPagoModel.propietario=x.nombreCompleto
    this._ordenPagoModel.nroDocIdentidad=x.nroDocIdentidad
    this._ordenPagoModel.idPersona=x.idPersona
    //this._deudaList= data.data.deudaList
    this._deudaList = this._deudaList ?? [];
    this._blockPrincipal=1
    this.calcularTotal()
    this.dialogEventual=false

  }

  guardar(){
    this._ordenPagoModel.impTotal=this.totalMonto
    this._ordenPagoModel.idSede=this.searchSede
    this._ordenPagoModel.idEmpresa=this.searchEmp
    this._ordenPagoModel.usuarioCreacion="CHIBELI"
    
    this.recaudacionService.GeneraOrdenPago(this._ordenPagoModel).subscribe({
      next: (respuesta) => {
        if (respuesta.success==true) {
          this.panelBusqueda.limpiar();
            this._blockPrincipal=0
            let mensajeAlert="Se Genero Orden de Pago Nro <br><strong style='font-size: 35px; '>"+ respuesta.dataId+ "</strong>"
            this.funcionesService.popupExitoCrud(mensajeAlert);
            //this.funcionesService.popupExito("Confirmacion","El Registro se Genero Correctamente");
            this.messageService.add({severity: 'success',summary: 'Confirmacion',detail: 'Registro Agregado',life: 3000});
            /*this._ordenPagoModel = data.data;
            this._deudaList= data.data.deudaList
            this._blockPrincipal=1
            this._ordenPagoModel.idPersona=null
            this.calcularTotal()
            
            this.mensajeAlert="Solicitud Ingresada Nro <br><strong style='font-size: 35px; '>"+ this.codigoAp_Derivacion+ "</strong>"
                     
                          Swal.fire({
                           icon: 'success',
                           title: this.mensajeAlert, 
                           showDenyButton: true,
                           confirmButtonText: "Aceptar",
                           denyButtonColor: ' #607D8B',
                           denyButtonText: `Imprimir`,
                           confirmButtonColor: '#03A9F4',
                         }).then((result) => {
                           if (result.isDenied) {
                             this.printBarra(this.codigoAp_Derivacion)
                             }
                         })

            
            
            */           
        } else {
          this.funcionesService.popupError("Aviso de Usuario",respuesta.message);
          this._blockPrincipal=0
        }
      },
      error: (err) => {
        this.funcionesService.popupError("Aviso de Usuario","ERROR DE EJECUCION");
        this._blockPrincipal=0
      }
    });
  }



  //BUSQEUDA CLIENTE

  Busqueda(){

    this._modalFiltroCliente.idEmpresa=1

    this.recaudacionService.BusquedaCliente(this._modalFiltroCliente).subscribe({
          next: (data) => {
            if (data.data.length != 0) {
              this._filtroCliente = data.data;
              this.blockTable = 1;
            } else {
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._filtroCliente = [];
              this.blockTable = 0;
            }
          },
          error: (err) => {
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._filtroCliente = [];
            this.blockTable = 0;
          }
        }); 
  }

  onRowSelectCliente(x:any){

    this._modalFiltro.idEmpresa=x.idEmpresa
    this._modalFiltro.idSede=x.idSede
    this._modalFiltro.nroSuministro=x.nroSuministro

    this.recaudacionService.ConsultaDeudaPago(this._modalFiltro).subscribe({
          next: (data) => {
            if (data.data != null) {
              this._ordenPagoModel = data.data;
              this._deudaList= data.data.deudaList
              this._blockPrincipal=1
              this._ordenPagoModel.idPersona=null
              this.calcularTotal()
              this.dialogCliente=false

              if(this._ordenPagoModel.mensaje!=null){
                this.funcionesService.popupAlerta(this._ordenPagoModel.mensaje);
              }
            } else {
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._blockPrincipal=0
              this.dialogCliente=false
            }
          },
          error: (err) => {
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._blockPrincipal=0
            this.dialogCliente=false
          }
        }); 


  }

  actualizaSucursal(x:any){
    if(x==true){
      this._modalFiltro.idSucursal=0
      this.blockLocalidad=1
    }else{
      this.blockLocalidad=0
    }
  }

  ModalClose(){
    this._filtroCliente = [];
    this.blockTable = 0;
  }



  onGlobalFilterOrdenes(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

}
