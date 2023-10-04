import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './components/shared/route-animation';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  animations:[
    slideInAnimation
  ]
})
export class AppComponent implements OnInit {

  title = 'tutoring_frontend';
  isMobile = false;

  ngOnInit(): void {
    if(document.body.offsetWidth < 750){
      this.isMobile = true;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event:any) {
    if(document.body.offsetWidth < 750 && this.isMobile == false){
      window.location.reload();
    }else if(document.body.offsetWidth >= 750 && this.isMobile == true){
      window.location.reload();
    }
  }

  prepareRoute(outlet: RouterOutlet) {
    return outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation'];
   }
}
