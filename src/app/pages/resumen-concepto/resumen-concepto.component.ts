import { Component, OnInit } from '@angular/core';
import { ParametrosModule } from '../parametros.module';
import { RecaudacionService } from '../../services/Recaudacion.service';
import { FuncionesService } from '../../services/funciones.service';
import { MessageService } from 'primeng/api';
import { GlobalSession } from '../utils/globalSession';
import { Localidad } from '../../models/Localidad';
import { Ciclo } from '../../models/Ciclo';
import { ResumenConcepto } from '../../models/ResumenConcepto';
import { Calendario } from '../../models/Calendario';
import { hideGlobalLoader, showGlobalLoader } from '@test/mf-utils-modules';

@Component({
  selector: 'app-resumen-concepto',
  imports: [ParametrosModule],
  templateUrl: './resumen-concepto.component.html',
  styleUrl: './resumen-concepto.component.scss',
  providers: [RecaudacionService]
})
export class ResumenConceptoComponent implements OnInit{
  
  idEmpresaTk = GlobalSession.idEmpresa;
  idSedeTk = GlobalSession.idSede;
  usuarioTk = GlobalSession.usuario;
  idUsuarioTk = GlobalSession.idUsuario;

  _localidad:Localidad[] = []
  _ciclo:Ciclo[] = []
  _resumenModel:ResumenConcepto=new ResumenConcepto
  _anioXciclo:Calendario[] = []
  _mesXciclo:Calendario[] = []
  _listaResumen:ResumenConcepto[] = []
  blockFiltro=0 
  urlView: string=""
  urlImpresion: string=""
  displayPDF:boolean=false

  totales = {
    mes: 0,
    atrazado: 0,
    ventadirecta: 0,
    fraccionamiento: 0,
    incobrable: 0,
    incobrablefracc: 0,
    importe: 0,
  };



  constructor(private recaudacionService:RecaudacionService,
    private funcionesService:FuncionesService,
    private messageService: MessageService
  ) 
  {}

  ngOnInit(): void {
    this.init()
  }

  init(){ 

    this.recaudacionService.dropdownLocalidad().subscribe((respuesta) => {
      this._localidad=respuesta.data
    })

    this.recaudacionService.dropdownCiclo(this.idSedeTk).subscribe((respuesta) => {
      this._ciclo = respuesta.data;
    });

    this.recaudacionService.ConsultaParamae({idEmpresa: this.idEmpresaTk,idSede: this.idSedeTk,tipoParametro: "REPORTES",codigoParametro:"URL"}).subscribe(data => {
      this.urlImpresion= data.data.valorParametro
    });


  }

  //_resumenModel

  changeCiclo(x:any){

    this.recaudacionService.dropdownAnio(x).subscribe((respuesta) => {
      this._anioXciclo = respuesta.data;
    });

  }
  changeAnio(x:any){

    this.recaudacionService.dropdownMes(this._resumenModel.idCiclo!,x).subscribe((respuesta) => {
      this._mesXciclo = respuesta.data;
    });
  }

  searchResumen(){

    if ( this._resumenModel.idCiclo ==null ) {
      this.messageService.add({severity: "warn",  summary: "Aviso de usuario",
        detail: "Debe Seleccionar Ciclo.", life: 3000
      });
      return;
    }

    if ( this._resumenModel.idSucursal==null ) {
      this.messageService.add({severity: "warn",  summary: "Aviso de usuario",
        detail: "Debe Seleccionar Localidad.", life: 3000
      });
      return;
    }

    if ( this._resumenModel.anio ==null ) {
      this.messageService.add({severity: "warn",  summary: "Aviso de usuario",
        detail: "Debe Seleccionar Año.", life: 3000
      });
      return;
    }

    if ( this._resumenModel.mes ==null ) {
      this.messageService.add({severity: "warn",  summary: "Aviso de usuario",
        detail: "Debe Seleccionar Mes.", life: 3000
      });
      return;
    }


    this._resumenModel.idEmpresa=this.idEmpresaTk
    this._resumenModel.idSede=this.idSedeTk
    showGlobalLoader()
    this.recaudacionService.searchResumenConcepto(this._resumenModel).subscribe({
      next: (data) => {
        if (data.data.length != 0) {
          this._listaResumen = data.data;

          this.totales = this._listaResumen.reduce((acc, item) => {
            acc.mes += item.mes || 0;
            acc.atrazado += item.atrazado || 0;
            acc.ventadirecta += item.ventadirecta || 0;
            acc.fraccionamiento += item.fraccionamiento|| 0;
            acc.incobrable += item.incobrable|| 0;
            acc.incobrablefracc += item.incobrablefracc|| 0;
            acc.importe += item.importe|| 0;
    
            return acc;
          }, {
            mes: 0,
            atrazado: 0,
            ventadirecta: 0,
            fraccionamiento: 0,
            incobrable: 0,
            incobrablefracc: 0,
            importe: 0,
          });
          this.blockFiltro = 1;
          hideGlobalLoader()
        } else {
          hideGlobalLoader()
          this.funcionesService.popupError("Búsqueda sin información", "");
          this._listaResumen = [];
          this.blockFiltro=0
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._listaResumen = [];
        this.blockFiltro=0
      }
    });

  }

  //http://apisistemas.ddns.net/comercialWEB/recaudacion/reporteCajaTarifa.php?idempresa=1&idsucursal=2&anio=2026&mes=1

  viewTarifas(){
    this.urlView=`${this.urlImpresion}/recaudacion/reporteCajaTarifa.php?idempresa=1&idsucursal=${this._resumenModel.idSucursal}&anio=${this._resumenModel.anio}&mes=${this._resumenModel.mes}&IdSede=${this.idSedeTk}` ;
    this.displayPDF=true
  }

  viewConcepto(){
    this.urlView=`${this.urlImpresion}/recaudacion/reporteCajaConcepto.php?idempresa=1&idsucursal=${this._resumenModel.idSucursal}&anio=${this._resumenModel.anio}&mes=${this._resumenModel.mes}&IdSede=${this.idSedeTk}` ;
    this.displayPDF=true
  }

  viewPlanilla(){
    this.urlView=`${this.urlImpresion}/cobranza/facturacionXPeriodo.php?IdEmpresa=1&IdSede=${this.idSedeTk}&Anio=${this._resumenModel.anio}&Mes=${this._resumenModel.mes}` ;
    this.displayPDF=true
  }

  viewTpDeuda(){
    this.urlView=`${this.urlImpresion}/recaudacion/cobranzaXTipoDeuda.php?idempresa=1&IdSede=${this.idSedeTk}&IdSucursal=${this._resumenModel.idSucursal}&Anio=${this._resumenModel.anio}&Mes=${this._resumenModel.mes}` ;
    this.displayPDF=true
  }

}
