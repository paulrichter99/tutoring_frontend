import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './components/about/about.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';

const routes: Routes = [
  { path: "", component: HomeComponent, data: { animation: "1"}},
  { path: "home", component: HomeComponent , data: { animation: "1"}},
  { path: "calendar", component: CalendarComponent, data: { animation: "2"}},
  { path: "about", component: AboutComponent , data: { animation: "3"}},
  { path: "profile", component: ProfileComponent , data: { animation: "4"}},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
