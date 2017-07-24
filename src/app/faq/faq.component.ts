import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  
  /**
   * toggle visibility of an FAQ content element and toggles caret if defined.
   */
  toggleVis(content, caret) {
    if (content.style.display === '') {
      content.style.display = 'none';
      if (caret) {
        caret.className = 'fa fa-caret-down';
      }
    } else {
      content.style.display = '';
      if (caret) {
        caret.className = 'fa fa-caret-up';
      }
    }
  }
  
  
  /**
   * hacks easy to use according function...
   * 
   * this can easily be used from the HTML -- see there for an example ;-)
   */
  accordion(clickEvent) {
    console.log(clickEvent);
    console.log(clickEvent.target.parentElement);
    
    let caret = null;
    for (let i = 0; i < clickEvent.target.childNodes.length; i++) {
      if (clickEvent.target.childNodes[i].nodeName === 'I') {
        caret = clickEvent.target.childNodes[i];
      }
    }
    
    const pDiv = clickEvent.target.parentElement.parentElement;
    
    for (let i = 0; i < pDiv.childNodes.length; i++) {
      if (pDiv.childNodes[i].nodeName === 'DIV') {
        this.toggleVis(pDiv.childNodes[i], caret);
      }
    }
  }
}
