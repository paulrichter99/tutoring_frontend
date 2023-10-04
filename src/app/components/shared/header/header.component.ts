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
      this.fixedNavDropdown.nativeElement.style.top = "200px";
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
}
