import { Component, HostListener, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { slideInAnimation } from './components/shared/route-animation';
import { User } from './interface/user';
import { StorageService } from './services/storage.service';
import { UserService } from './services/user.service';


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

  constructor(
    private userService: UserService,
    private storageService: StorageService) {
  }

  user: User | null = null;

  ngOnInit(): void {
    this.user = this.storageService.getLocalUserData();
    if(document.body.offsetWidth < 750){
      this.isMobile = true;
    }

    if(localStorage.getItem("jwt_token")){
      this.userService.getUserData().subscribe({
        next: (userData: any) => {
          this.user = <User>userData;
          this.storageService.saveUserData(this.user!);

          if(this.user.isTutor){
            this.getAllUsernames();
          }
          else{
            this.storageService.deleteAllUsernames();
          }
        },
        error: (e) => {
          console.error(e)
        }
      })
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

   getAllUsernames(){
    this.userService.getUsers().subscribe({
      next: data => {
        this.storageService.saveAllUser(data as User[])
      },
      error: e => console.error(e)
    })
   }
}
