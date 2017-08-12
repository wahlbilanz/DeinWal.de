import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

// This impl. bases upon one that can be found in the router's test cases.
export class CustomReuseStrategy implements RouteReuseStrategy {

    handlers: {[key: string]: DetachedRouteHandle} = {};

    shouldDetach(route: ActivatedRouteSnapshot): boolean {
//        console.log('CustomReuseStrategy:shouldDetach', route);
        return true;
    }

    store(route: ActivatedRouteSnapshot, handle: DetachedRouteHandle): void {
//        console.log('CustomReuseStrategy:store', route, handle);
        this.handlers[route.routeConfig.path] = handle;
    }

    shouldAttach(route: ActivatedRouteSnapshot): boolean {
//        console.log('CustomReuseStrategy:shouldAttach', route);
        return !!route.routeConfig && !!this.handlers[route.routeConfig.path];
    }

    retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
//        console.log('CustomReuseStrategy:retrieve', route);
        if (!route.routeConfig) {
          return null;
      }
        return this.handlers[route.routeConfig.path];
    }

    shouldReuseRoute(future: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
//        console.log('CustomReuseStrategy:shouldReuseRoute', future, curr);
        return future.routeConfig === curr.routeConfig;
    }
}
