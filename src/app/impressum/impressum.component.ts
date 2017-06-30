import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-impressum',
  templateUrl: './impressum.component.html',
  styleUrls: ['./impressum.component.css']
})
export class ImpressumComponent implements OnInit {

  test1 = {ja:234, nein:11};
  test2 = "moin!";
  constructor() { }

  ngOnInit() {
  }

}
