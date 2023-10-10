import { Component, ElementRef, HostBinding, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/interface/user';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit{
  @ViewChild('fixedNavBackground', { static: true }) fixedNavBackground!: ElementRef;
  @ViewChild('fixedNavDropdown', { static: true }) fixedNavDropdown!: ElementRef;
  @ViewChild('dropdownContent', { static: true }) dropdownContent!: ElementRef;
  @ViewChild('dropdown', { static: true }) dropdown!: ElementRef;

  dropdownIsOpen: boolean = false;

  constructor(private userService: UserService){}

  user: User | null = null;

  ngOnInit(): void {
    if(localStorage.getItem("jwt_token")){
      this.userService.getUserData().subscribe({
        next: (userData) => {
          this.user = userData;
          this.dropdown.nativeElement.style.display="block";
        },
        error: (e) => console.error(e)
      })
    }
  }
  performDropdownClick(){
    if(window.innerWidth < 750){
      this.performMobileDropdownClick();
      return;
    }
    if(!this.dropdownIsOpen){
      this.dropdownContent.nativeElement.style.marginRight = "0px";
      this.fixedNavBackground.nativeElement.style.display = "block";
    }else{
      this.dropdownContent.nativeElement.style.marginRight = "-500px";
      this.fixedNavBackground.nativeElement.style.display = "none";
    }
    this.dropdownIsOpen = !this.dropdownIsOpen
  }
  performMobileDropdownClick() {
    if(!this.dropdownIsOpen){
      this.fixedNavDropdown.nativeElement.style.top = "160px";
      this.fixedNavBackground.nativeElement.style.display = "block";

    }else{
      this.fixedNavDropdown.nativeElement.style.top = "100vh";
      this.fixedNavBackground.nativeElement.style.display = "none";
    }
    this.dropdownIsOpen = !this.dropdownIsOpen
  }

  hideFixedMenu(){
    this.fixedNavBackground.nativeElement.style.display = "none";
    this.fixedNavDropdown.nativeElement.style.top = "100vh";
    this.dropdownContent.nativeElement.style.marginRight = "-500px";
    this.dropdownIsOpen = false;
  }

  openLoginModal(){
    const loginModalComponentWrapper = <HTMLElement> document.getElementById('login-modal-component-wrapper');

    // FIXME: this was implemented to achieve an (fade-)animation, since it wouldn't initially work I just
    //  dropped the animation for now
    // const loginBackground = <HTMLElement> document.getElementById('login-background');
    // const loginModalWrapper = <HTMLElement> document.getElementById('login-modal-wrapper');

    loginModalComponentWrapper.style.display = "flex";
    // loginBackground.style.top = "0";
    // loginModalWrapper.style.top = "0";

    // loginModalComponentWrapper.style.opacity = "1";
  }

  logout(){
    this.user = null;
    localStorage.removeItem("jwt_token");
    window.location.reload();
  }
}
