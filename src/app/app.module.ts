import { QuestiondataService } from './questiondata.service';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
//import { HttpClientModule } from '@angular/httpclient';
import { RouteReuseStrategy, ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BundestagsWal2017 } from './2017-btw/btw17.component';
import { EuropaWal2019 } from './2019-eu/eu19.component';
import { FaqComponent } from './faq/faq.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { PartyVotesComponent } from './party-votes/party-votes.component';
import { HomeComponent } from './home/home.component';
import { CustomReuseStrategy } from './route.reuse';
import { HttpModule } from '@angular/http';

@NgModule({
  declarations: [
    AppComponent,
    BundestagsWal2017,
    EuropaWal2019,
    FaqComponent,
    ImpressumComponent,
    PartyVotesComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [QuestiondataService, {provide: RouteReuseStrategy, useClass: CustomReuseStrategy}],
  bootstrap: [AppComponent]
})
export class AppModule { }
