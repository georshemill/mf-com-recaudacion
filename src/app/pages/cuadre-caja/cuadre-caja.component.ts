import { Component, inject, PLATFORM_ID, ViewChild } from '@angular/core';
import { MessageService } from 'primeng/api';
import { FuncionesService } from '../../services/funciones.service';
import { RecaudacionService } from '../../services/Recaudacion.service';
import { ParametrosModule } from '../parametros.module';
import { Sede } from '../../models/Sede';
import { GlobalSession } from '../utils/globalSession';
import { GestionCuadre } from '../../models/GestionCuadre';
import { hideGlobalLoader, showGlobalLoader } from '@test/mf-utils-modules';
import { isPlatformBrowser } from '@angular/common';
import { ChartModule, UIChart } from 'primeng/chart';
import { LayoutService } from '../../layout/service/layout.service';
import { CuadrexImporte } from '../../models/CuadrexImporte';
import { Car } from '../../models/Car';

@Component({
  selector: 'app-cuadre-caja',
  imports: [ParametrosModule,ChartModule,],
  templateUrl: './cuadre-caja.component.html',
  styleUrl: './cuadre-caja.component.scss',
  providers: [RecaudacionService]
})
export class CuadreCajaComponent {

  idEmpresaTk = GlobalSession.idEmpresa;
  idSedeTk = GlobalSession.idSede;
  usuarioTk = GlobalSession.usuario;
  idUsuarioTk = GlobalSession.idUsuario;
  
  fechActual=new Date();
  fechActualFiltro = new Date().toLocaleDateString('en-CA');
  _sede:Sede[] = []
  _cuadreModel:GestionCuadre=new GestionCuadre
  _cuadrexForma:GestionCuadre[] = []
  _cuadrexTipo:GestionCuadre[] = []
  _cuadrexSede:GestionCuadre[] = []
  _cuadrexComprobante:GestionCuadre[] = []
  _cuadrexImporte:CuadrexImporte[] = []
  blockTable:number=0
  blockPadron:number=0
  urlView: string=""
  displayPDF:boolean=false
  Fechatotal: string=""

  totalMontoxConcepto: number = 0;

  filtroCar: number = 0;

  _car:Car[] = []
  expandedRows: Record<number, boolean> = {};  

  //GRAFICAS
  @ViewChild('doughnutChart') doughnutViewChild!: UIChart;
  platformId = inject(PLATFORM_ID);
  layoutService = inject(LayoutService);

  data: any;
  dataTorta: any;
  dataTorta2: any;
  dataTorta3: any;

  options: any;
  optionsTorta: any;
  optionsTorta2: any;
  optionsTorta3: any;

  cantidadConcepto: number[] = [];
  nombreConcepto: string[] = [];
  cantidadFormaPago: number[] = [];
  nombreFormaPago: string[] = [];
  cantidadXSede: number[] = [];
  nombreXSede: string[] = [];
  cantidadXComprobante: number[] = [];
  nombreXComprobante: string[] = [];

  totales = {
    totalConcepto: 0,
    impAlca: 0,
    impIgv: 0,
    impInteres: 0,
    impOtrosConceptos: 0,
    impTotalMes: 0,
    redondeoActual: 0,
    redondeoAnterior: 0,
    impCargoFijo: 0
  };


tabs = [
    { title: 'Resumen por Tipo de Cobranza', value: "0", icon: 'pi pi-ticket'},
    { title: 'Resumen por Importe de Pago', value: "1", icon: 'pi pi-money-bill'},
    { title: 'Balancín', value: "2", icon: 'pi pi-address-book' },
]

activeAccordionIndex: number[] = [0];
accordions = {
  ruta_distribucion: [0],
  distribucion_recibo: [0],
  actualizacion_catastral: [0],
  direccion: [0],
  solicitante: [0],
}; 

constructor(private recaudacionService:RecaudacionService,
              private funcionesService:FuncionesService,
              private messageService: MessageService) 
    {}

ngOnInit(): void {
    this.init() 
}


init(){

  this._cuadreModel.idEmpresa=this.idEmpresaTk
  this._cuadreModel.idSedeBsq=this.idSedeTk
  this._cuadreModel.fechaDpl=this.funcionesService.devolverFecha(this.fechActual)


  this.recaudacionService.dropdownSede().subscribe((respuesta) => {
    this._sede=respuesta.data
  })


  this.recaudacionService.dropdownCar(this.idEmpresaTk!, this.idSedeTk!, this.usuarioTk).subscribe((respuesta) => {
    this._car = respuesta.data;
    
    // Verifica que _car no esté vacío y accede al primer registro
    if (this._car && this._car.length > 0) {
      this.filtroCar = this._car[0].idCar;
    } else {
    }
  });



}

Busqueda(){

  //console.log(this._cuadreModel.fechaDpl)

  if(!this._cuadreModel.idSedeBsq?.toString().trim() //&&!this._cuadreModel.nrodocumentoBsq?.toString().trim()&&
       //!this._cuadreModel.nrosuministroBsq?.toString().trim() 
       && !this._cuadreModel.fechaDpl?.toString().trim()){

      this.funcionesService.popupError("Ingrese Campos de Busqueda","");
    }

  showGlobalLoader()

  /*IdEmpresa INT,
    @IdSede INT,
    @IdCar INT,
    @UsuarioCreacion VARCHAR(20),
    @Fecha DATE*/

    this._cuadreModel.idEmpresa=this.idEmpresaTk
    this._cuadreModel.idSede=this.idSedeTk
    this._cuadreModel.idCar=1//idCar,
    this._cuadreModel.usuarioCreacion=this.usuarioTk
    //this._cuadreModel.fecha=this._cuadreModel.fechaDpl//this.funcionesService.devolverFecha(this._cuadreModel.fechaDpl)
    const fecha = this._cuadreModel.fechaDpl;

    // Regex para formato YYYY-MM-DD
    const formatoISO = /^\d{4}-\d{2}-\d{2}$/;

    if (formatoISO.test(fecha!)) {
      this._cuadreModel.fecha = fecha;
    } else {
      this._cuadreModel.fecha = this.funcionesService.devolverFecha(fecha);
    }



  this.recaudacionService.CuadrexConcepto(this._cuadreModel).subscribe({
      next: (data) => {
        if (data.data.length != 0) {
          this._cuadrexTipo = data.data;
          this.totalMontoxConcepto = this._cuadrexTipo.reduce(
            (sum, item) => sum + item.importe,
            0
          );
          
          this.cantidadConcepto= this._cuadrexTipo.map(item => item.importe);
          this.nombreConcepto= this._cuadrexTipo.map(item => item.tipoDeuda);
          this.initChartTorta();
          this.blockTable=1

          hideGlobalLoader()
        } else {
          hideGlobalLoader()
          this._cuadrexTipo = [];
          this.blockTable=0
          //this._gestionSolicitudModel.nrosolicitudBsq=null
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._cuadrexTipo = [];
        this.blockTable=0
        //this._gestionSolicitudModel.nrosolicitudBsq=null
      }
  }); 

  this.recaudacionService.CuadrexFormaPago(this._cuadreModel).subscribe({
      next: (data) => {
        if (data.data.length != 0) {
          this._cuadrexForma = data.data;
          this.cantidadFormaPago= this._cuadrexForma.map(item => item.impTotal);
          this.nombreFormaPago= this._cuadrexForma.map(item => item.formaPago);
          this.initChart();
          this.blockTable=1

          hideGlobalLoader()
        } else {
          hideGlobalLoader()
          this._cuadrexForma = [];
          this.blockTable=0
          //this._gestionSolicitudModel.nrosolicitudBsq=null
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._cuadrexForma = [];
        this.blockTable=0
        //this._gestionSolicitudModel.nrosolicitudBsq=null
      }
  });

  this.recaudacionService.CuadrexSede(this._cuadreModel).subscribe({
    next: (data) => {
        if (data.data.length != 0) {
          this._cuadrexSede = data.data;
          this.cantidadXSede= this._cuadrexSede.map(item => item.impTotal);
          this.nombreXSede= this._cuadrexSede.map(item => item.nombreSede);
          this.initChartTorta2();
          this.blockTable=1

          hideGlobalLoader()
        } else {
          hideGlobalLoader()
          this._cuadrexSede = [];
          this.blockTable=0
          //this._gestionSolicitudModel.nrosolicitudBsq=null
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._cuadrexSede = [];
        this.blockTable=0
        //this._gestionSolicitudModel.nrosolicitudBsq=null
      }
    });
   

  this.recaudacionService.CuadrexComprobante(this._cuadreModel).subscribe({
    next: (data) => {
        if (data.data.length != 0) {
          this._cuadrexComprobante = data.data;
          this.cantidadXComprobante= this._cuadrexComprobante.map(item => item.impTotal);
          this.nombreXComprobante= this._cuadrexComprobante.map(item => item.tipoComprobante);
          this.initChartTorta3();
          this.blockTable=1

          hideGlobalLoader()
        } else {
          hideGlobalLoader()
          this._cuadrexSede = [];
          this.blockTable=0
          //this._gestionSolicitudModel.nrosolicitudBsq=null
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._cuadrexSede = [];
        this.blockTable=0
        //this._gestionSolicitudModel.nrosolicitudBsq=null
      }
    });

  /*this.recaudacionService.CuadrexImporte({idEmpresa:this.idEmpresaTk,idSede:3,fecha:"2025-04-08",
                                          idCar:0,usuarioCreacion:"MIGRA"}).subscribe({*/

                                          const fecha1 = this._cuadreModel.fechaDpl;

    // Regex para formato YYYY-MM-DD
    const formatoISO1 = /^\d{4}-\d{2}-\d{2}$/;
   

    if (formatoISO1.test(fecha1!)) {
      this.Fechatotal = fecha!;
    } else {
      this.Fechatotal = this.funcionesService.devolverFecha(fecha);
    }
                                          
  this.recaudacionService.CuadrexImporte({idEmpresa:this.idEmpresaTk,idSede:this.idSedeTk,fecha:this.Fechatotal!,
                                          idCar:this.filtroCar,usuarioCreacion:this.usuarioTk}).subscribe({

    next: (data) => {
        if (data.data.length != 0) {
          this._cuadrexImporte = data.data;
          this.blockTable=1
          this.blockPadron=1

          hideGlobalLoader()
        } else {
          hideGlobalLoader()
          this._cuadrexSede = [];
          this.blockTable=0
          //this._gestionSolicitudModel.nrosolicitudBsq=null
        }
      },
      error: (err) => {
        hideGlobalLoader()
        this.funcionesService.popupError("Búsqueda sin información", "Intente nuevamente");
        this._cuadrexSede = [];
        this.blockTable=0
        //this._gestionSolicitudModel.nrosolicitudBsq=null
      }
    });

}

viewPDF(){
  this.urlView="http://apisistemas.ddns.net/comercialWEB/recaudacion/cuadreCaja.php?idempresa="+this.idEmpresaTk+"&idsede="+this.idSedeTk+"&idCar="+this.filtroCar+"&fecha="+this.Fechatotal+"&usuarioCreacion="+this.usuarioTk+""
  
  //http://apisistemas.ddns.net/comercialWEB/recaudacion/cuadreCaja.php?idempresa=1&idSede=1&idCar=1&fecha=2026-01-12&usuarioCreacion=CAJACH
  this.displayPDF=true

}

expandAll() {
  this.expandedRows = this._cuadrexImporte.reduce((acc, p) => {
    acc[p.impTotal] = true; 
    return acc;
  }, {} as Record<number, boolean>); 
}

collapseAll() {
    this.expandedRows = {};
}
  


initChartTorta() {
  if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');

      this.dataTorta = {
          labels: this.nombreConcepto,
          datasets: [
              {
                  data: this.cantidadConcepto,
                  backgroundColor: [documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-orange-500'), documentStyle.getPropertyValue('--p-gray-500'), documentStyle.getPropertyValue('--p-yellow-800'), documentStyle.getPropertyValue('--p-blue-800')],
                  hoverBackgroundColor: [documentStyle.getPropertyValue('--p-cyan-400'), documentStyle.getPropertyValue('--p-orange-400'), documentStyle.getPropertyValue('--p-gray-400'), documentStyle.getPropertyValue('--p-yellow-800'), documentStyle.getPropertyValue('--p-blue-800')]
              }
          ]
      };

      this.optionsTorta = {
          cutout: '60%',
          plugins: {
              legend: {
                  labels: {
                      color: textColor
                  }
              }
          }
      };
  }
}

initChartTorta2() {
    if (isPlatformBrowser(this.platformId)) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--p-text-color');

        this.dataTorta2 = {
            labels: this.nombreXSede,
            datasets: [
                {
                    data: this.cantidadXSede,
                    backgroundColor: [documentStyle.getPropertyValue('--p-orange-500'), documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-gray-500'), documentStyle.getPropertyValue('--p-yellow-800'), documentStyle.getPropertyValue('--p-blue-800')],
                    hoverBackgroundColor: [documentStyle.getPropertyValue('--p-orange-400'), documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-gray-400'), documentStyle.getPropertyValue('--p-yellow-800'), documentStyle.getPropertyValue('--p-blue-800')]
                }
            ]
        };

        this.optionsTorta2 = {
            cutout: '60%',
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            }
        };
    }
}

initChartTorta3() {
  if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');

      this.dataTorta3 = {
          labels: this.nombreXComprobante,
          datasets: [
              {
                  data: this.cantidadXComprobante,
                  backgroundColor: [documentStyle.getPropertyValue('--p-orange-500'), documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-gray-500'), documentStyle.getPropertyValue('--p-yellow-800'), documentStyle.getPropertyValue('--p-blue-800')],
                  hoverBackgroundColor: [documentStyle.getPropertyValue('--p-orange-400'), documentStyle.getPropertyValue('--p-cyan-500'), documentStyle.getPropertyValue('--p-gray-400'), documentStyle.getPropertyValue('--p-yellow-800'), documentStyle.getPropertyValue('--p-blue-800')]
              }
          ]
      };

      this.optionsTorta3 = {
          cutout: '60%',
          plugins: {
              legend: {
                  labels: {
                      color: textColor
                  }
              }
          }
      };
  }
}

initChart() {
  if (isPlatformBrowser(this.platformId)) {
      const documentStyle = getComputedStyle(document.documentElement);
      const textColor = documentStyle.getPropertyValue('--p-text-color');
      const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');
      
      this.data = {
          datasets: [
              { //const conteos = data.map(item => item.conteo);
                  

                  data: this.cantidadFormaPago,//[11, 16, 7, 3, 14],
                  backgroundColor: [
                      documentStyle.getPropertyValue('--p-pink-500'),
                      documentStyle.getPropertyValue('--p-gray-500'),
                      documentStyle.getPropertyValue('--p-orange-500'),
                      documentStyle.getPropertyValue('--p-purple-500'),
                      documentStyle.getPropertyValue('--p-cyan-500')
                  ],
                  label: 'Cantidad'
              }
          ],
          labels: this.nombreFormaPago, //['Pink', 'Gray', 'Orange', 'Purple', 'Cyan']
      };

      this.options = {
          plugins: {
              legend: {
                  labels: {
                      color: textColor
                  }
              }
          },
          scales: {
              r: {
                  grid: {
                      color: surfaceBorder
                  }
              }
          }
      };
      //this.cd.markForCheck()
  }
}

//PARA TORTAS

colorKeys = ['indigo', 'blue', 'cyan', 'green', 'emerald', 'orange', 'yellow'];

items = [
    { label: 'Update', icon: 'pi pi-fw pi-refresh' },
    { label: 'Edit', icon: 'pi pi-fw pi-pencil' }
];





setChartOptions() {
  const textColor = getComputedStyle(document.body).getPropertyValue('--text-color');
  const surfaceBorder = getComputedStyle(document.body).getPropertyValue('--surface-border');

  return {
      plugins: {
          legend: {
              labels: {
                  color: textColor,
                  boxWidth: 12,
                  boxHeight: 4
              },
              position: 'bottom'
          }
      },
      maintainAspectRatio: false,
      elements: { point: { radius: 0 } },
      scales: {
          x: {
              ticks: {
                  color: textColor
              },
              grid: {
                  color: surfaceBorder
              }
          },
          y: {
              ticks: {
                  color: textColor,
                  stepSize: 10
              },
              grid: {
                  color: surfaceBorder
              }
          }
      }
  };
}

setChartData() {
  return {
      labels: ['January', 'February', 'March', 'April', 'May'],
      datasets: [
          {
              label: 'Previous Month',
              borderColor: '#E0E0E0',
              tension: 0.5,
              data: [22, 36, 11, 33, 2]
          },
          {
              label: 'Current Month',
              borderColor: '#6366F1',
              tension: 0.5,
              data: [22, 16, 31, 11, 38]
          }
      ]
  };
}




getDoughnutData() {
const documentStyle = getComputedStyle(document.documentElement);
const borderColor = getComputedStyle(document.body).getPropertyValue('--surface-border') || 'rgba(160, 167, 181, .3)';
const suffix = this.layoutService.isDarkTheme() ? '400' : '500';
const backgroundColor = this.colorKeys.map((color: string) => documentStyle.getPropertyValue(`--p-${color}-${suffix}`));

return {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    datasets: [
        {
            data: [11, 29, 71, 33, 28, 95, 6],
            backgroundColor,
            borderColor
        }
    ]
};
}

getDoughnutOptions() {
const textColor = getComputedStyle(document.body).getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
const fontFamily = getComputedStyle(document.body).getPropertyValue('--font-family');

return {
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    family: fontFamily
                },
                color: textColor
            }
        }
    },
    responsive: true,
    maintainAspectRatio: false,
    circumference: 180,
    rotation: -90,
    animation: {
        animateScale: true,
        animateRotate: true
    }
};
}

changeDoughnutDataView() {
  if (this.doughnutViewChild.chart.options.circumference === 180) {
      this.doughnutViewChild.chart.options.circumference = 360;
      this.doughnutViewChild.chart.options.rotation = -45;
  } else {
      this.doughnutViewChild.chart.options.circumference = 180;
      this.doughnutViewChild.chart.options.rotation = -90;
  }

  this.doughnutViewChild.chart.update();
}

/*

_cuadrexForma:GestionCuadre[] = []
  _cuadrexTipo:GestionCuadre[] = []
  _cuadrexSede


                IdEmpresa INT,
    @IdSede INT,
    @IdCar INT,
    @UsuarioCreacion VARCHAR(20),
    @Fecha DATE */

}
