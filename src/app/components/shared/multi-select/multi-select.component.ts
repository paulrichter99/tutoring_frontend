import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'multi-select',
  templateUrl: './multi-select.component.html',
  styleUrls: ['./multi-select.component.scss']
})
export class MultiSelectComponent implements OnInit{
  @Input() options: string[] | null = null;
  @Input() currentValues: string[] = [];

  @Output() changeSelectArray = new EventEmitter<string>();

  displayOptions: string[] = [];

  @ViewChild('selectDropdown', { static: true }) selectDropdown!: ElementRef;

  chevronSymbolString = "fa-circle-chevron-right"
  isDropdownOpen: boolean = false;
  searchString: string = "";

  ngOnInit(): void {
    if(this.options)
      this.options = this.options.slice();

    this.displayOptions = this.options!;
  }

  performDropdownClick(){
    if(!this.isDropdownOpen){
      this.chevronSymbolString = "fa-circle-chevron-down";
      this.selectDropdown.nativeElement.style.display = "block";
    }else{
      this.chevronSymbolString = "fa-circle-chevron-right";
      this.selectDropdown.nativeElement.style.display = "none";
    }

    this.isDropdownOpen = !this.isDropdownOpen;
  }

  performOptionClick(option: string){
    this.changeSelectArray.next(option);
  }

  filterUsernames(event: Event){
    const inputElement = event.target as HTMLInputElement
    if(inputElement.value == "") this.displayOptions = this.options!;
    else this.displayOptions = this.options!.filter(opt => opt.includes(inputElement.value))
  }
}
