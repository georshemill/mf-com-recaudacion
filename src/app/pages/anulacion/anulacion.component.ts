import { Component, OnInit } from '@angular/core';
import { ParametrosModule } from '../parametros.module';
import { RecaudacionService } from '../../services/Recaudacion.service';
import { GlobalSession } from '../utils/globalSession';
import { FuncionesService } from '../../services/funciones.service';
import { MessageService } from 'primeng/api';
import { Car } from '../../models/Car';
import { Router } from '@angular/router';
import { OrdenPago } from '../../models/OrdenPago';
import { BusquedAnulacionPago } from '../../models/BusquedAnulacionPago';
import { Table, TableRowCollapseEvent, TableRowExpandEvent } from 'primeng/table';

@Component({
  selector: 'app-anulacion',
  imports: [ParametrosModule],
  templateUrl: './anulacion.component.html',
  styleUrl: './anulacion.component.scss',
   providers: [RecaudacionService]
})
export class AnulacionComponent implements OnInit {

  fechActual = new Date().toLocaleDateString('en-CA');
  idEmpresaTk = GlobalSession.idEmpresa;
  idSedeTk = GlobalSession.idSede;
  usuarioTk = GlobalSession.usuario;
  idUsuarioTk = GlobalSession.idUsuario;

  dialogformCar:boolean=false
  dialogAnulacion:boolean=false
  _car:Car[] = []
  _anulacionModel:OrdenPago=new OrdenPago
  _listXAnulacion:BusquedAnulacionPago[] = []
  _listAnulados:BusquedAnulacionPago[] = []
  
  car: string | null = null
  carId: number | null = null


  tabs = [{ title: 'Listado de Pagos', value: "0", icon: 'pi pi-dollar'},
          { title: 'Listado de Anulaciones', value: "1", icon: 'pi pi-delete-left' },
        ]



      //  expandedRows = {};
      expandedRows: Record<number, boolean> = {};  


  constructor(private recaudacionService:RecaudacionService,
              private funcionesService:FuncionesService,
              private router: Router,
              private messageService: MessageService) {}


  ngOnInit(): void {

    this._anulacionModel.fechaEmision =this.fechActual

    this.init()
    
  }

  init(){

    this.recaudacionService.dropdownCar(this.idEmpresaTk,this.idSedeTk,this.usuarioTk).subscribe((respuesta) => {
      this._car=respuesta.data
    })

    this.listAnulacion() 

    this.dialogformCar=true

  }

  //PROBANDO NUEVATABLA

  expandAll() {
    this.expandedRows = this._listXAnulacion.reduce((acc, p) => {
      acc[p.nroSuministro] = true; 
      return acc;
    }, {} as Record<number, boolean>); 
  }

collapseAll() {
    this.expandedRows = {};
}

  onRowExpand(event: TableRowExpandEvent) {
    //this.messageService.add({ severity: 'info', summary: 'Product Expanded', detail: event.data.name, life: 3000 });
}

onRowCollapse(event: TableRowCollapseEvent) {
    //this.messageService.add({ severity: 'success', summary: 'Product Collapsed', detail: event.data.name, life: 3000 });
}





  //SE CIERRA TABLA

  listAnulacion(){

    this.recaudacionService.ConsultaPagosAnulacion({idEmpresa:this.idEmpresaTk,idSede:this.idSedeTk,fecha:this._anulacionModel.fechaEmision!,
                                                    usuarioCreacion:"MIGRA",nroPago:null, anulado:0}).subscribe((respuesta) => {
        this._listXAnulacion=respuesta.data
    })

    this.recaudacionService.ConsultaPagosAnulacion({idEmpresa:this.idEmpresaTk,idSede:this.idSedeTk,fecha:this._anulacionModel.fechaEmision!,
                                                    usuarioCreacion:"MIGRA",nroPago:null, anulado:1}).subscribe((respuesta) => {
        this._listAnulados=respuesta.data
    })

  }

  validaLogin(){
  
    if(this._anulacionModel.validaPass==undefined || this._anulacionModel.validaPass==null || this._anulacionModel.validaPass=="" ){
      
      this.messageService.add({ severity: "warn",summary: "Aviso de usuario",detail: "Ingresar Contraseña",life: 3000});
      return;
    }
  
    if( this._anulacionModel.idCar==undefined || this._anulacionModel.idCar==null || this._anulacionModel.idCar==0){

      this.messageService.add({ severity: "warn",summary: "Aviso de usuario", detail: "Ingresar Car",life: 3000});
      return;
    }
  
    this.recaudacionService.ValidaLoginPago({idUsuario:this.idUsuarioTk,clave:this._anulacionModel.validaPass}).subscribe({
        next: (data) => {
          if (data == true) {
            this.carId=this._anulacionModel.idCar
            this.dialogformCar=false
              
          } else {
            this.messageService.add({severity: "warn",summary: "Aviso de usuario",detail: "Contraseña Incorrecta",life: 3000});
            return;
          }
        },
        error: (err) => {
          this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        
        }
      });
  
    }



  cancelarLogin(){
    this.router.navigate(['/comercial/recaudacion/dashboard']);
  }

  onFechaEmisionChange(x:any){
    
      const year = x.getFullYear();
      const month = String(x.getMonth() + 1).padStart(2, '0'); 
      const day = String(x.getDate()).padStart(2, '0');
      this._anulacionModel.fechaEmision =`${year}-${month}-${day}`;

    this.listAnulacion()
  }


  onRowAnulacion(x:any){
    this._anulacionModel.motivoAnulacion=null
    this._anulacionModel.impTotalAnula=this.funcionesService.roundToFix(x.impTotal,2)
    this._anulacionModel.nroPago=x.nroPago
    this._anulacionModel.nroSuministro=x.nroSuministro
    this.dialogAnulacion=true

  }

  genAnulacion(){

    if( this._anulacionModel.motivoAnulacion==undefined || this._anulacionModel.motivoAnulacion==null || this._anulacionModel.motivoAnulacion=="" ){
      this.messageService.add({
        severity: "warn",summary: "Aviso de usuario",
        detail: "Ingresar Motivo de Anulacion",life: 3000});
    return;
    }

    this.funcionesService.popupConfirmacion("Desea Realizar la Anulacion ?","","Anular").then((result)=>{
      if(result.isConfirmed){
        //this.dialogVuelto=false
        this.guardarAnulacion()
      }
    });

  }

  guardarAnulacion(){
    this._anulacionModel.idSede=this.idSedeTk!
    this._anulacionModel.idEmpresa=this.idEmpresaTk!
    this._anulacionModel.usuarioCreacion=this.usuarioTk
    this._anulacionModel.idCar=this.carId
    this._anulacionModel.usuarioAutorizador="ADMIN"


    this.recaudacionService.AnulaPagoxOrden(this._anulacionModel).subscribe({
      next: (data) => {
        if (data.dataId !=0 ) {
          this.dialogAnulacion=false
          this._anulacionModel.motivoAnulacion=null
          this.listAnulacion()
          this.funcionesService.popupExito("Aviso de Usuario", data.message);
        } else {
          this.dialogAnulacion=false
          this._anulacionModel.motivoAnulacion=null
          this.funcionesService.popupError("Aviso de Usuario", data.message);
        }
      },
      error: (err) => {
        this.dialogAnulacion=false
        this._anulacionModel.motivoAnulacion=null
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
      }
    });
  

   
  }


  onGlobalFilterAnulados(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  onGlobalFilterPagos(table: Table, event: Event) {
      table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  
    

    toggleOptions(event: Event, opt: HTMLElement, date: HTMLElement) {
      if (event.type === 'mouseenter') {
          opt.style.display = 'flex';
          date.style.display = 'none';
      } else {
          opt.style.display = 'none';
          date.style.display = 'flex';
      }
    }




}
