import { Component, enableProdMode } from '@angular/core';
import { settings } from './settings';
import { Title } from '@angular/platform-browser';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  
  // setup route-listener to update title of the page 
  constructor(router:Router, private titleService:Title) {
       router.events.subscribe((event)=>{ 
          if(event instanceof NavigationEnd) {
            var title = this.getTitle(router.routerState, router.routerState.root).join('-');
            console.log('title', title);
            titleService.setTitle(title + " | "  + settings.title);
          }
       });
     if (settings.production)
       enableProdMode ();
    }
  
  /**
   * overwrite the page title
   * 
   * this way components can overwrite the page's title.
   * `settings.title` will always be appended!
   */
  overwriteTitle (title) {
    this.titleService.setTitle(title + " | "  + settings.title);
  }
  
  
  
  /**
   * print some debug message, unless we're in production mode...
   */
  log (...msg) {
    if (!settings.production)
      console.log (msg);
  }
  
  
  
  // get the title based on route-definition
  getTitle (state, parent) {
    var data = [];
    if (parent && parent.snapshot.data && parent.snapshot.data.title) {
      data.push(parent.snapshot.data.title);
    }

    if(state && parent) {
      data.push(... this.getTitle(state, state.firstChild(parent)));
    }
    return data;
  }
}
