import { FaqComponent } from './faq/faq.component';
import { QuizComponent } from './quiz/quiz.component';
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
    path: 'quiz',
    component: QuizComponent,
    data: {title: 'Quiz'}
  },
  {
    path: 'quiz/:questionPage',
    component: QuizComponent,
    data: {title: 'Quiz'}
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
