import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.css']
})
export class ImpressumComponent implements OnInit {

  addr = 'info <ät> deinWal [punkt] de ';
  contactlink = 'https://binfalse.de';
  
  constructor() {
    this.addr = this.addr.replace(' <ät> ', '@').replace(' [punkt] ', '.');
    const tmp = 'ailt';
      this.contactlink = 'm' + tmp + 'o:' + this.addr;
   }

  ngOnInit() {
  }

}
