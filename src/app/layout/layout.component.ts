import { Component, computed, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { Toast } from 'primeng/toast';
import { LayoutService } from './service/layout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, Toast],
  templateUrl: './layout.component.html',
})
export class LayoutComponent implements OnDestroy {
  overlayMenuOpenSubscription: Subscription;
  menuOutsideClickListener: any;
  menuScrollListener: any;

  constructor(
    public layoutService: LayoutService,
    public renderer: Renderer2,
    public router: Router
  ) {
    this.overlayMenuOpenSubscription =
      this.layoutService.overlayOpen$.subscribe(() => {
        if (!this.menuOutsideClickListener) {
          this.menuOutsideClickListener = this.renderer.listen(
            'document',
            'click',
            (event) => {
              console.log('Mostrando evento rederer');

              // const isOutsideClicked = !(
              //   this.appSidebar.appMenu.el.nativeElement.isSameNode(
              //     event.target
              //   ) ||
              //   this.appSidebar.appMenu.el.nativeElement.contains(
              //     event.target
              //   ) ||
              //   this.appTopbar.menuButton.nativeElement.isSameNode(
              //     event.target
              //   ) ||
              //   this.appTopbar.menuButton.nativeElement.contains(event.target)
              // );
              // if (isOutsideClicked) {
              //   this.hideMenu();
              // }
            }
          );
        }

        if (
          (this.layoutService.isSlim() || this.layoutService.isSlimPlus()) &&
          !this.menuScrollListener
        ) {
          // this.menuScrollListener = this.renderer.listen(
          //   this.appSidebar.appMenu.menuContainer.nativeElement,
          //   'scroll',
          //   (event) => {
          //     if (this.layoutService.isDesktop()) {
          //       this.hideMenu();
          //     }
          //   }
          // );
        }

        if (this.layoutService.layoutState().staticMenuMobileActive) {
          // this.blockBodyScroll();
        }
      });
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // this.hideMenu();
      });
  }

  containerClass = computed(() => {
    const layoutConfig = this.layoutService.layoutConfig();
    const layoutState = this.layoutService.layoutState();

    return {
      'layout-overlay': layoutConfig.menuMode === 'overlay',
      'layout-static': layoutConfig.menuMode === 'static',
      'layout-slim': layoutConfig.menuMode === 'slim',
      'layout-slim-plus': layoutConfig.menuMode === 'slim-plus',
      'layout-horizontal': layoutConfig.menuMode === 'horizontal',
      'layout-reveal': layoutConfig.menuMode === 'reveal',
      'layout-drawer': layoutConfig.menuMode === 'drawer',
      'layout-sidebar-dark': layoutConfig.darkTheme,
      'layout-static-inactive':
        layoutState.staticMenuDesktopInactive &&
        layoutConfig.menuMode === 'static',
      'layout-overlay-active': layoutState.overlayMenuActive,
      'layout-mobile-active': layoutState.staticMenuMobileActive,
      'layout-topbar-menu-active': layoutState.topbarMenuActive,
      'layout-menu-profile-active': layoutState.rightMenuActive,
      'layout-sidebar-active': layoutState.sidebarActive,
      'layout-sidebar-anchored': layoutState.anchored,
      [`layout-topbar-${layoutConfig.topbarTheme}`]: true,
      [`layout-menu-${layoutConfig.menuTheme}`]: true,
      [`layout-menu-profile-${layoutConfig.menuProfilePosition}`]: true,
    };
  });
  ngOnDestroy() {
    if (this.overlayMenuOpenSubscription) {
      this.overlayMenuOpenSubscription.unsubscribe();
    }

    if (this.menuOutsideClickListener) {
      this.menuOutsideClickListener();
    }
  }
}
