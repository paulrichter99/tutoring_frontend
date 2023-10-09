import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('loginModalComponentWrapper', { static: true }) loginModalComponentWrapper!: ElementRef;
  // FIXME: this was implemented to achieve an (fade-)animation, since it wouldn't initially work I just
  //  dropped the animation for now

  //@ViewChild('loginBackground', { static: true }) loginBackground!: ElementRef;
  //@ViewChild('loginModalWrapper', { static: true }) loginModalWrapper!: ElementRef;

  constructor(private userService: UserService, private storageService: StorageService){ }

  ngOnInit(): void {
    // TODO: change me to login credentials from form and on login

  }

  hideLoginModal(){
    this.loginModalComponentWrapper.nativeElement.style.display = "none";
    /*
    this.loginModalComponentWrapper.nativeElement.style.opacity = 0;
    this.loginBackground.nativeElement.style.top = "100vh";
    this.loginModalWrapper.nativeElement.style.top = "100vh";
    */
  }

  login(){
    this.userService.loginUser({"username":"paulrichter99", "password":"test1234"}).subscribe({
      next: (data) => {
        if(data.accessToken){
          this.storageService.saveAccessToken(data.accessToken)
          window.location.reload();
        }
      },
      error: (e) => console.error(e)
    })
  }
}
