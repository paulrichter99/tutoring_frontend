import { AfterViewInit, Component, ElementRef, HostBinding, Input, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/interface/user';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';
import { ACCESS_TOKEN, BASE_PROFILE_PATH, HEADER_HEIGHT_MOBILE, USER_DATA } from 'src/app/variables/variables';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent{
  @ViewChild('fixedNavBackground', { static: true }) fixedNavBackground!: ElementRef;
  @ViewChild('fixedNavDropdown', { static: true }) fixedNavDropdown!: ElementRef;
  @ViewChild('dropdownContent', { static: true }) dropdownContent!: ElementRef;

  @Input() user: User | null = null;

  baseProfilePath = BASE_PROFILE_PATH;

  dropdownIsOpen: boolean = false;

  constructor(
    private userService: UserService,
    private storageService: StorageService){}
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
      this.fixedNavDropdown.nativeElement.style.top = (HEADER_HEIGHT_MOBILE+30) + "px";
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
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem(USER_DATA)
    window.location.reload();
  }
}
