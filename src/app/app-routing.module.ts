import { FaqComponent } from './faq/faq.component';
import { BundestagsWal2017 } from './2017-btw/btw17.component';
import { HomeComponent } from './home/home.component';
import { ImpressumComponent } from './impressum/impressum.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    component: HomeComponent,
    data: {title: 'Home'}
  },
  {
    path: 'bundestagswal2017',
    component: BundestagsWal2017,
    data: {title: 'Quiz zur Bundestagswahl 2017'}
  },
  {
    path: 'bundestagswal2017/:questionPage',
    component: BundestagsWal2017,
    data: {title: 'Quiz zur Bundestagswahl 2017'}
  },
  {
    path: 'impressum',
    component: ImpressumComponent,
    data: {title: 'Impressum'}
  },
  {
    path: 'faq',
    component: FaqComponent,
    data: {title: 'FAQ'}
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
