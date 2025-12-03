import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'comercial/recaudacion/dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'comercial/recaudacion/OrdenPago',
        loadComponent: () =>
          import('./pages/orden-pago/orden-pago.component').then((m) => m.OrdenPagoComponent),
      },
      {
        path: 'comercial/recaudacion/Pago',
        loadComponent: () =>
          import('./pages/pago/pago.component').then((m) => m.PagoComponent),
      },
      {
        path: 'comercial/recaudacion/AnulacionPago',
        loadComponent: () =>
          import('./pages/anulacion/anulacion.component').then((m) => m.AnulacionComponent),
      },
      {
        path: 'comercial/recaudacion/CuadreCaja',
        loadComponent: () =>
          import('./pages/cuadre-caja/cuadre-caja.component').then((m) => m.CuadreCajaComponent),
      },
      /*{
        path: 'comercial/catastro/HorarioAbastecimiento',
        loadComponent: () =>
          import('./pages/catastro/horario-abastecimiento/horario-abastecimiento.component').then((c) => c.HorarioAbastecimientoComponent),
      },
      {
        path: 'comercial/catastro/PanelBusqueda',
        loadComponent: () =>
          import('./shared/panel-busqueda/panel-busqueda.component').then((c) => c.PanelBusquedaComponent),
      },*/
      

     
      {
        path: 'comercial/recaudacion/notfound',
        loadComponent: () =>
          import('./pages/notfound/notfound').then((c) => c.Notfound),
      },
      


      
    ],
  },
  { path: '**', redirectTo: 'comercial/recaudacion/notfound' }
];
