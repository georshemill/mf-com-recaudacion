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
import { Car } from '../../models/Car';
import { GlobalSession } from '../utils/globalSession'
import { ResumenCaja } from '../../models/ResumenCaja';
import { InputNumber } from 'primeng/inputnumber';
import Swal from 'sweetalert2';
import { ValidaPassPago } from '../../models/ValidaPassPago';
import { Router } from '@angular/router';
import { showGlobalLoader, hideGlobalLoader } from '@test/mf-utils-modules';



type IntBooleanKeys<T> = {
  [K in keyof T]: T[K] extends 0 | 1 ? K : never
}[keyof T];

@Component({
  selector: 'app-pago',
  imports: [ParametrosModule],
  templateUrl: './pago.component.html',
  styleUrl: './pago.component.scss',
  providers: [RecaudacionService]
})
export class PagoComponent implements OnInit{
  @ViewChild('inputSearch') inputSearch!: InputNumber;

  //fechActual = new Date().toISOString().slice(0, 10);
  fechActual = new Date().toLocaleDateString('en-CA');
  _blockPrincipal:number=0
  dialogColateral:boolean=false
  dialogOrden:boolean=false
  dialogEventual:boolean=false
  dialogCliente:boolean=false
  dialogVuelto:boolean=false
  formCar:boolean=false
  _colateral:Colateral[] = []
  _comprobante:Comprobante[] = []
  _car:Car[] = []
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
  _listBusquedaPago:BusquedaOrdenPago[] = []
  _modalFiltro:OrdenPago=new OrdenPago
  _filtroCliente:FiltroCliente[] = []
  _modalFiltroCliente:FiltroCliente=new FiltroCliente
  blockLocalidad:number=0
  _localidad:Localidad[] = []
  _resumenCajaModel:ResumenCaja=new ResumenCaja
  _validaPassModel:ValidaPassPago=new ValidaPassPago

  flagGeneraPago: number = 0;
  carId: number = 0;
  efectivo = 0.0;
  vuelto = 0.0;

  //PARA CAR
  

  idEmpresaTk = GlobalSession.idEmpresa;
  idSedeTk = GlobalSession.idSede;
  usuarioTk = GlobalSession.usuario;
  idUsuarioTk = GlobalSession.idUsuario;




   constructor(private recaudacionService:RecaudacionService,
              private funcionesService:FuncionesService,
              private router: Router,
              private messageService: MessageService
    ) 
    {}

  ngOnInit(): void {
    this.init()
  }

  

  init(){
    this.recaudacionService.ListColateral({idEmpresa:this.idEmpresaTk,idSede:1}).subscribe((respuesta) => {
      this._colateral=respuesta.data
    })

    this.recaudacionService.dropdownComprobante().subscribe((respuesta) => {
      this._comprobante=respuesta.data
    })


    this.recaudacionService.ListDeudaPagos({idEmpresa:this.idEmpresaTk,idSede:1}).subscribe((respuesta) => {
      this._listBusquedaPago=respuesta.data
    })

    this.recaudacionService.dropdownTipoFormaPago().subscribe((respuesta) => {
      this._formaPago=respuesta.data
    })

    this.recaudacionService.dropdownCar(this.idEmpresaTk!,this.idSedeTk!,this.usuarioTk).subscribe((respuesta) => {
      this._car=respuesta.data
    })

    this.formCar=true

  }

  ResumenCaja(idCar:any){
    this.recaudacionService.ResumenCaja({idEmpresa:this.idEmpresaTk,idSede:this.idSedeTk,usuarioCreacion:this.usuarioTk,
                                         idCar:idCar,fecha:this.fechActual}).subscribe((respuesta) => {
      this._resumenCajaModel=respuesta.data
    })
  
  }

  //MODAL LOGIN PAGOS

  validaLogin(){

    if( this._ordenPagoModel.validaPass==undefined || this._ordenPagoModel.validaPass==null || this._ordenPagoModel.validaPass=="" ){
      this.messageService.add({
        severity: "warn",summary: "Aviso de usuario",
        detail: "Ingresar Contraseña",life: 3000});
    return;
    }

    if( this._ordenPagoModel.idCar==undefined || this._ordenPagoModel.idCar==null || this._ordenPagoModel.idCar==0){
      this.messageService.add({
        severity: "warn",summary: "Aviso de usuario",
        detail: "Ingresar Car",life: 3000});
    return;
    }

    this.recaudacionService.ValidaLoginPago({idUsuario:this.idUsuarioTk!,clave:this._ordenPagoModel.validaPass}).subscribe({
      next: (data) => {
        if (data == true) {
          this.carId=this._ordenPagoModel.idCar!
          this.ResumenCaja(this._ordenPagoModel.idCar)
          this.formCar=false
            
        } else {
          this.messageService.add({severity: "warn",summary: "Aviso de usuario",detail: "Contraseña Incorrecta",life: 3000});
          return;
        }
      },
      error: (err) => {
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._blockPrincipal=0
      }
    });

  }
  
  cancelarLogin(){

    this.router.navigate(['/comercial/recaudacion/dashboard']);

  }



  recibirBusqueda(x: any) {

    showGlobalLoader()
    if(x.nroSuministro>0){
      this._ordenPagoModel.idSede=this.idSedeTk
      this._ordenPagoModel.idEmpresa=this.idEmpresaTk
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
            this._ordenPagoModel.idFormaPago=1
            this.onChangeFormaPago(1)
            hideGlobalLoader()
            
        } else {
          hideGlobalLoader()
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._blockPrincipal=0
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._blockPrincipal=0
      }
    });
  }


  BusquedaOrdenDirecta(){
    showGlobalLoader()
    this._modalFiltro.idEmpresa=this.idEmpresaTk
    this._modalFiltro.idSede=this.idSedeTk

    this.recaudacionService.ConsultaDeudaPago(this._modalFiltro).subscribe({
          next: (data) => {
            if (data.data != null) {
              this._ordenPagoModel = data.data;
              this._deudaList= data.data.deudaList
              this._blockPrincipal=1
              this._ordenPagoModel.idPersona=null
              this.calcularTotal()
              this.flagGeneraPago=0
              this._ordenPagoModel.idFormaPago=1
              this.onChangeFormaPago(1)
              hideGlobalLoader()

              if(this._ordenPagoModel.mensaje!=null){
                this.funcionesService.popupAlerta(this._ordenPagoModel.mensaje);
              }
            } else {
              hideGlobalLoader()
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._blockPrincipal=0
              this.flagGeneraPago=0
            }
          },
          error: (err) => {
            hideGlobalLoader()
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._blockPrincipal=0
            this.flagGeneraPago=0
          }
        }); 
  }

  BusquedaOrdenDirectaCaja(){
    showGlobalLoader()
    this._modalFiltro.idEmpresa=this.idEmpresaTk
    this._modalFiltro.idSede=this.idSedeTk

    this.recaudacionService.ConsultaDeudaPagoCaja(this._modalFiltro).subscribe({
          next: (data) => {
            if (data.data != null) {
              this._ordenPagoModel = data.data;
              this._deudaList= data.data.deudaList
              this._blockPrincipal=1
              this._ordenPagoModel.idPersona=null
              this.calcularTotal()
              this.flagGeneraPago=1
              this._ordenPagoModel.idFormaPago=1
              this.onChangeFormaPago(1)
              hideGlobalLoader()

              if(this._ordenPagoModel.mensaje!=null){
                this.funcionesService.popupAlerta(this._ordenPagoModel.mensaje);
              }
            } else {
              hideGlobalLoader()
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._blockPrincipal=0
              this.flagGeneraPago=0
            }
          },
          error: (err) => {
            hideGlobalLoader()
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._blockPrincipal=0
            this.flagGeneraPago=0
          }
        }); 
  }


  onRowSelectOrden(x:any){

    showGlobalLoader()
    this._modalFiltro.nroSuministro=null
    this._modalFiltro.idEmpresa=x.idEmpresa
    this._modalFiltro.idSede=x.idSede
    this._modalFiltro.nroOrdenPago=x.nroOrdenPago

    this.recaudacionService.ConsultaDeudaPagoCaja(this._modalFiltro).subscribe({
          next: (data) => {
            if (data.data != null) {
              this._ordenPagoModel = data.data;
              this._deudaList= data.data.deudaList
              this._blockPrincipal=1
              this._ordenPagoModel.idPersona=null
              this.calcularTotal()
              this.dialogOrden=false
              this.flagGeneraPago=1
              this._ordenPagoModel.idFormaPago=1
              this.onChangeFormaPago(1)
              hideGlobalLoader()

              if(this._ordenPagoModel.mensaje!=null){
                this.funcionesService.popupAlerta(this._ordenPagoModel.mensaje);
              }
            } else {
              hideGlobalLoader()
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._blockPrincipal=0
              this.dialogOrden=false
              this.flagGeneraPago=0
            }
          },
          error: (err) => {
            hideGlobalLoader()  
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._blockPrincipal=0
            this.dialogOrden=false
            this.flagGeneraPago=0
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
    this._ordenPagoModel.impFormaPago=this.funcionesService.roundToFix(parseFloat(this.totalMonto as any ),2)
  } 


  calcularTotal() {
    //this.totalMonto = this._deudaList.reduce((acc, item) => acc + item.impTotalMes, 0); LOQ UE TENIA INCIAL
    //this.totalMonto = this.funcionesService.roundToFix((this._deudaList ?? []).reduce((acc, item) => acc + (item.impTotalMes || 0),0),2);
    
    this.totalMonto = Number(
      this.funcionesService.roundToFix(
        (this._deudaList ?? []).reduce((acc, item) => acc + (item.impTotalMes || 0), 0),
        2
      )
    );
    

    
   this.efectivo=this.totalMonto
  }

  colateral(){
    this.dialogColateral=true

  }

  BusquedaPersona(){

    showGlobalLoader()
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
          hideGlobalLoader()
          this._personas = data.data;
          //this.nrodocumento = "";
          //this.datos = "";
          this.blockTable = 1;
        } else {
          hideGlobalLoader()
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._personas = [];
          this.blockTable = 0;
          this.nrodocumento = "";
          this.datos = "";
        }
      },
      error: (err) => {
        hideGlobalLoader()
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

  validaForm(){

    if( this._ordenPagoModel.idFormaPago==undefined || this._ordenPagoModel.idFormaPago==null || this._ordenPagoModel.idFormaPago==0 ){
      this.messageService.add({
        severity: "warn",summary: "Aviso de usuario",
        detail: "Ingresar Forma de Pago",life: 3000});
    return;
    }

    if( this._ordenPagoModel.impFormaPago==undefined || this._ordenPagoModel.impFormaPago==null || this._ordenPagoModel.impFormaPago==""  ){
      this.messageService.add({
        severity: "warn",summary: "Aviso de usuario",
        detail: "Ingresar Importe de Pago",life: 3000});
    return;
    }


    //this.efectivo=this.totalMonto
    this.calcularVuelto()
    this.dialogVuelto=true

  }

  calcularVuelto() {
    const resultado = this.efectivo - this.totalMonto;
    this.vuelto = Math.abs(resultado) < 0.001 ? 0 : resultado;
  }

  cancelarVuelto(){
    
    this.dialogVuelto=false
    this.efectivo=this.totalMonto
    this.vuelto=0.0 
  }

  pagarDeduda(){
    
   
     if( this.efectivo! <this.totalMonto  ){
      this.messageService.add({
        severity: "warn",summary: "Aviso de usuario",
        detail: "El Importe debe ser mayor o igual que el Total",life: 3000});
    return;
    }
    //this.funcionesService.popupConfirmacion("Anulacion","Desea Anular la Solicitud?","Anular").then((result)=>{
      this.funcionesService.popupConfirmacion("Desea Realizar el Pago ?","","Pagar").then((result)=>{
        if(result.isConfirmed){
          this.dialogVuelto=false
          this.guardar()
        }
      });
  }

  guardar(){
    showGlobalLoader()
    this._ordenPagoModel.idSede=this.idSedeTk!
    this._ordenPagoModel.idEmpresa=this.idEmpresaTk!
    this._ordenPagoModel.usuarioCreacion=this.usuarioTk
    this._ordenPagoModel.idCar=this.carId

    if(this.flagGeneraPago==0){

      this.recaudacionService.GeneraPagoCaja(this._ordenPagoModel).subscribe({
        next: (respuesta) => {
          if (respuesta.success==true) {
              this._modalFiltro.nroOrdenPago=null
              this._modalFiltro.nroSuministro=null
              this._ordenPagoModel.flagEventual=0
              this._ordenPagoModel.flagBarras=0
              this.ResumenCaja(this._ordenPagoModel.idCar)
              this._blockPrincipal=0
              hideGlobalLoader()
              let mensajeAlert="Se Genero Orden de Pago Nro <br><strong style='font-size: 35px; '>"+ respuesta.dataId+ "</strong>"
              
              Swal.fire({
                icon: 'success',
                title: mensajeAlert, 
                showDenyButton: true,
                confirmButtonText: "Aceptar",
                denyButtonColor: ' #607D8B',
                denyButtonText: `Imprimir`,
                confirmButtonColor: '#03A9F4',
              }).then((result:any) => {
                if (result.isConfirmed) {
                  // Si el usuario hizo clic en "Aceptar", enfocar y seleccionar el input
                  this.inputSearch.input?.nativeElement.focus();
                  this.inputSearch.input?.nativeElement.select();
                }
              
                if (result.isDenied) {
                  // Si el usuario hizo clic en "Imprimir"
                  // this.printBarra(this.codigoAp_Derivacion);
                }
              });
              
              //this.funcionesService.popupExitoCrud(mensajeAlert);
              /*this.messageService.add({severity: 'success',summary: 'Confirmacion',detail: 'Registro Agregado',life: 3000});
                    
              setTimeout(() => {
                this.inputSearch.input?.nativeElement.focus();
                this.inputSearch.input?.nativeElement.select();
              }, 5000);*/

          } else {
            hideGlobalLoader()
            this.funcionesService.popupError("Aviso de Usuario",respuesta.message);
            this._blockPrincipal=0

            setTimeout(() => {
              this.inputSearch.input?.nativeElement.focus();
              this.inputSearch.input?.nativeElement.select();
            }, 100);
          }
        },
        error: (err) => {
          hideGlobalLoader()
          this.funcionesService.popupError("Aviso de Usuario","ERROR DE EJECUCION");
          this._blockPrincipal=0

          setTimeout(() => {
            this.inputSearch.input?.nativeElement.focus();
            this.inputSearch.input?.nativeElement.select();
          }, 100);
        }
      });
    }else{
      this.recaudacionService.RegistrarPagoxOrden(this._ordenPagoModel).subscribe({
        next: (respuesta) => {
          if (respuesta.success==true) {
              this._modalFiltro.nroOrdenPago=null
              this._modalFiltro.nroSuministro=null
              this._ordenPagoModel.flagEventual=0
              this._ordenPagoModel.flagBarras=0
              this.ResumenCaja(this._ordenPagoModel.idCar)
              this._blockPrincipal=0
              hideGlobalLoader()
              let mensajeAlert="Se Genero Orden de Pago Nro <br><strong style='font-size: 35px; '>"+ respuesta.dataId+ "</strong>"
              this.funcionesService.popupExitoCrud(mensajeAlert);
              this.messageService.add({severity: 'success',summary: 'Confirmacion',detail: 'Registro Agregado',life: 3000});
                    
              setTimeout(() => {
                this.inputSearch.input?.nativeElement.focus();
                this.inputSearch.input?.nativeElement.select();
              }, 100);

          } else {
            this._modalFiltro.nroOrdenPago=null
            this._modalFiltro.nroSuministro=null
            this._ordenPagoModel.flagEventual=0
            this._ordenPagoModel.flagBarras=0
            this.funcionesService.popupError("Aviso de Usuario",respuesta.message);
            this._blockPrincipal=0
            hideGlobalLoader()

            setTimeout(() => {
              this.inputSearch.input?.nativeElement.focus();
              this.inputSearch.input?.nativeElement.select();
            }, 100);

          }
        },
        error: (err) => {
          this._modalFiltro.nroOrdenPago=null
          this._modalFiltro.nroSuministro=null
          this._ordenPagoModel.flagEventual=0
          this._ordenPagoModel.flagBarras=0
          this.funcionesService.popupError("Aviso de Usuario","ERROR DE EJECUCION");
          this._blockPrincipal=0
          hideGlobalLoader()

          setTimeout(() => {
            this.inputSearch.input?.nativeElement.focus();
            this.inputSearch.input?.nativeElement.select();
          }, 100);

        }
      });
    }
    
    
  }



  //BUSQEUDA CLIENTE

  Busqueda(){
    showGlobalLoader()
    this._modalFiltroCliente.idEmpresa=this.idEmpresaTk

    this.recaudacionService.BusquedaCliente(this._modalFiltroCliente).subscribe({
          next: (data) => {
            if (data.data.length != 0) {
              this._filtroCliente = data.data;
              this.blockTable = 1;
              hideGlobalLoader()
            } else {
              hideGlobalLoader()
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._filtroCliente = [];
              this.blockTable = 0;
            }
          },
          error: (err) => {
            hideGlobalLoader()
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._filtroCliente = [];
            this.blockTable = 0;
          }
        }); 
  }

  onRowSelectCliente(x:any){

    showGlobalLoader()
    this._modalFiltro.nroOrdenPago=null
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
              this.flagGeneraPago=0
              hideGlobalLoader()

              if(this._ordenPagoModel.mensaje!=null){
                this.funcionesService.popupAlerta(this._ordenPagoModel.mensaje);
              }
            } else {
              hideGlobalLoader()
              this.funcionesService.popupError("Búsqueda sin información", "");
              this._blockPrincipal=0
              this.dialogCliente=false
              this.flagGeneraPago=0
            }
          },
          error: (err) => {
            hideGlobalLoader()
            this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
            this._blockPrincipal=0
            this.dialogCliente=false
            this.flagGeneraPago=0
          }
        }); 


  }

  onChangeFormaPago(x:any){

    if(x==1){
      this._ordenPagoModel.impFormaPago= this.funcionesService.roundToFix(parseFloat(this.totalMonto as any),2)   
    }else{
      this._ordenPagoModel.impFormaPago=this.funcionesService.roundToFix(parseFloat(this.totalMonto as any),2)   
    }

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
