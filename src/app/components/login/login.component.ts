import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  @ViewChild('loginModalComponentWrapper', { static: true }) loginModalComponentWrapper!: ElementRef;
  @ViewChild('loginButton', { static: true }) loginButton!: ElementRef;
  // FIXME: this was implemented to achieve an (fade-)animation, since it wouldn't initially work I just
  //  dropped the animation for now

  //@ViewChild('loginBackground', { static: true }) loginBackground!: ElementRef;
  //@ViewChild('loginModalWrapper', { static: true }) loginModalWrapper!: ElementRef;

  loginForm: FormGroup;
  wrongCredentials: boolean = false;
  processingLogin: boolean = false;

  constructor(
    private userService: UserService,
    private storageService: StorageService,
    private formBuilder: FormBuilder){
      this.loginForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required],
      });
    }

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
    const val = this.loginForm.value;
    this.processingLogin = true;
    this.loginButton.nativeElement.disabled = true;
    if (val.username && val.password) {
      this.userService.loginUser({"username": val.username, "password": val.password}).subscribe({
        next: (data) => {
          if(data.accessToken){
            this.storageService.saveAccessToken(data.accessToken)
            window.location.reload();
          }
        },
        error: (e) => {
          this.handleLoginFailureError(e);
        }
      })
    }
  }

  handleLoginFailureError(e: Error){
    // display wrong credentials text
    console.error(e.message)
    this.wrongCredentials = true;
    this.processingLogin = false;
    this.loginButton.nativeElement.disabled = false;
  }
}
