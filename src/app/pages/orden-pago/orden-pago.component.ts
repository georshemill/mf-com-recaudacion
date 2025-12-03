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
import { GlobalSession } from '../utils/globalSession'
import { showGlobalLoader, hideGlobalLoader } from '@test/mf-utils-modules';
import { BusquedaOrdenPago } from '../../models/BusquedaOrdenPago';



type IntBooleanKeys<T> = {
  [K in keyof T]: T[K] extends 0 | 1 ? K : never
}[keyof T];

@Component({
  selector: 'app-orden-pago',
  imports: [ParametrosModule,PanelBusquedaComponent],
  templateUrl: './orden-pago.component.html',
  styleUrl: './orden-pago.component.scss',
  providers: [RecaudacionService]
})
export class OrdenPagoComponent implements OnInit{
  @ViewChild(PanelBusquedaComponent) panelBusqueda!: PanelBusquedaComponent;
  _blockPrincipal:number=0
  dialogColateral:boolean=false
  dialogEventual:boolean=false
  _colateral:Colateral[] = []
  _comprobante:Comprobante[] = []
  _serieComprobante:SerieComprobante[] = []
  _ordenPagoModel:OrdenPago=new OrdenPago
  _deudaList:Deuda[] = []
  totalMonto: number = 0;
  totalIGV: number = 0;
  totalBase: number = 0;
  _personas:Personas[] = []
  blockTable:number=0
  nrodocumento: string=""
  datos: string=""
  campo: string=""
  parametro: string=""
  _listBusquedaPago:BusquedaOrdenPago[] = []
  codigoAntiguo:number=0
  

  
  idEmpresaTk = GlobalSession.idEmpresa;
  idSedeTk = GlobalSession.idSede;
  usuarioTk = GlobalSession.usuario;
  idUsuarioTk = GlobalSession.idUsuario;


  tabs = [
    { title: 'Generar Órden de Pago', value: "0", icon: 'pi pi-home'},
    { title: 'Órdenes de Pagos', value: "1", icon: 'pi pi-address-book' },
  ]
  

   constructor(private recaudacionService:RecaudacionService,
              private funcionesService:FuncionesService,
              private messageService: MessageService) 
    {}

  ngOnInit(): void {
    this.init()
    
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  init(){
    this.recaudacionService.ListColateral({idEmpresa:this.idEmpresaTk!,idSede:this.idSedeTk!}).subscribe((respuesta) => {
      this._colateral=respuesta.data
    })

    this.recaudacionService.dropdownComprobante().subscribe((respuesta) => {
      this._comprobante=respuesta.data
    })

    this.recaudacionService.ListDeudaPagosTAB({idEmpresa:this.idEmpresaTk,idSede:this.idSedeTk}).subscribe((respuesta) => {
      this._listBusquedaPago=respuesta.data
    })
  }


  recibirBusqueda(x: any) {

    //showGlobalLoader()
   
    console.log(x)
    if(x.nroSuministro>0){
      this._ordenPagoModel.idSede=x.idSede
      this._ordenPagoModel.idEmpresa=1
      this._ordenPagoModel.nroSuministro=x.nroSuministro
      this.codigoAntiguo=x.codigoAntiguo
    }else{
      this._blockPrincipal=0
    }

    this.recaudacionService.ConsultaOrdenPago(this._ordenPagoModel).subscribe({
      next: (data) => {
        if (data.data != null) {
            this._blockPrincipal=1
            this._ordenPagoModel = data.data;
            this._ordenPagoModel.codigo_antiguo=this.codigoAntiguo
            //this._deudaList= data.data.deudaList
            this._deudaList = data.data.deudaList.map(x => ({ ...x, flagEditable: false }));
            
            this._ordenPagoModel.idPersona=null
            this.calcularTotal()
            hideGlobalLoader()
            
        } else {
          hideGlobalLoader()
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._blockPrincipal=0
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Error", err);
        this._blockPrincipal=0
      }
    });
  }

   setCheckboxValue(prop: IntBooleanKeys<OrdenPago>, checked: boolean): void {
        this._ordenPagoModel[prop] = checked ? 1 : 0;
  
        if(this._ordenPagoModel.flagEventual===0){
          this.panelBusqueda.limpiar();
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
          this.panelBusqueda.limpiar();
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

    const duplicado = this._deudaList.some((f) => f.idConcepto === x.idConcepto);
    if (duplicado) {
      this.messageService.add({
        severity: "warn",summary: "Aviso de usuario",
        detail: "El Registro ya se encuentra Asignado",life: 3000});
        return;
    }

    deuda.flagEditable = x.flagEditable
    deuda.impIGV = x.impIgv
    deuda.baseImponible = x.baseImponible
    deuda.descripcion = x.descripcion
    deuda.impTotalMes = x.impTotal
    deuda.idConcepto =x.idConcepto
    deuda.flagEnReclamo = false
    deuda.flagNoFacturado = false
    deuda.nuevo = true; 
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

  calcularIgv(pago: any) {
    const BASE_RATE = 1.18; // La tasa para calcular la base imponible (total con IGV / 1.18)
    pago.impIGV = pago.impTotalMes - (pago.impTotalMes / BASE_RATE); // Calcula el IGV restando la base imponible
    pago.baseImponible=pago.impTotalMes-pago.impIGV
    this.calcularTotal()
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

    showGlobalLoader()

    this.recaudacionService.listarPersonas(this.campo, this.parametro).subscribe({
      next: (data) => {
        if (data.data.length != 0) {
          this._personas = data.data;
          //this.nrodocumento = "";
          //this.datos = "";
          this.blockTable = 1;
          hideGlobalLoader()
        } else {
          this.funcionesService.popupError("Búsqueda sin información", "");
          hideGlobalLoader()
          this._personas = [];
          this.blockTable = 0;
          this.nrodocumento = "";
          this.datos = "";
        }
      },
      error: (err) => {
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        hideGlobalLoader()
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
    this._ordenPagoModel.idSede=this.idSedeTk
    this._ordenPagoModel.idEmpresa=this.idEmpresaTk
    this._ordenPagoModel.usuarioCreacion=this.usuarioTk

    this._ordenPagoModel.deudaList=this._deudaList

    const importeCero = this._deudaList.some((f) => f.impTotalMes === 0);
    if (importeCero) {
      this.messageService.add({
        severity: "warn", 
        summary: "Aviso de usuario",
        detail: "El Conpecto Agregado debe ser mayor a 0.", 
        life: 3000
      });
      return;
    }
  
    showGlobalLoader()     
    
    this.recaudacionService.GeneraOrdenPago(this._ordenPagoModel).subscribe({
      next: (respuesta) => {
        if (respuesta.success==true) {
          this.panelBusqueda.limpiar();
            hideGlobalLoader()
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
          hideGlobalLoader()
          this.funcionesService.popupError("Aviso de Usuario",respuesta.message);
          //this._blockPrincipal=0
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Aviso de Usuario","ERROR DE EJECUCION");
        this._blockPrincipal=0
      }
    });
  }


onGlobalFilterOrdenes(table: Table, event: Event) {
  table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
}

}
