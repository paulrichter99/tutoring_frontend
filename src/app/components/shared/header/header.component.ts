import { Component, ElementRef, HostBinding, ViewChild } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  @ViewChild('fixedNavBackground', { static: true }) fixedNavBackground!: ElementRef;
  @ViewChild('fixedNavDropdown', { static: true }) fixedNavDropdown!: ElementRef;

  dropdownIsOpen: boolean = false;

  performDropdownClick(){
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
    this.dropdownIsOpen = false;
  }

  openLoginModal(){
    const loginModalComponentWrapper = <HTMLElement> document.getElementById('login-modal-component-wrapper');
    const loginBackground = <HTMLElement> document.getElementById('login-background');
    const loginModalWrapper = <HTMLElement> document.getElementById('login-modal-wrapper');

    loginModalComponentWrapper.style.display = "flex";
    loginBackground.style.top = "0";
    loginModalWrapper.style.top = "0";

    loginModalComponentWrapper.style.opacity = "1";
  }
}
