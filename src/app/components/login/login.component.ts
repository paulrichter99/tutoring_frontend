import { Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  @ViewChild('loginModalComponentWrapper', { static: true }) loginModalComponentWrapper!: ElementRef;
  @ViewChild('loginBackground', { static: true }) loginBackground!: ElementRef;
  @ViewChild('loginModalWrapper', { static: true }) loginModalWrapper!: ElementRef;

  hideLoginModal(){
    console.log("click")
    this.loginModalComponentWrapper.nativeElement.style.display = "none";
    this.loginModalComponentWrapper.nativeElement.style.opacity = 0;
    this.loginBackground.nativeElement.style.top = "100vh";
    this.loginModalWrapper.nativeElement.style.top = "100vh";
  }
}
