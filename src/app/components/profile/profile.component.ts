import { Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { User } from 'src/app/interface/user';
import { UserSettings } from 'src/app/interface/userSettings';
import { StorageService } from 'src/app/services/storage.service';
import { UserService } from 'src/app/services/user.service';
import { BASE_PROFILE_PATH, BASE_URL } from 'src/app/variables/variables';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit{
  @ViewChild('profilePictureModal', { static: true }) profilePictureModal!: ElementRef;

  user: User | null = null;
  currentSettingShown: string = "personal";

  baseProfilePath = BASE_PROFILE_PATH;

  constructor(
    private storageService: StorageService,
    private location: Location,
    private formBuilder: FormBuilder,
    private userService: UserService){
  }

  newSettingsForm: FormGroup | null = null;

  ngOnInit(): void {
    this.user = this.storageService.getLocalUserData();
    if(this.user == null){
      console.error("Could not load user information. Returning.")
      this.location.back();
    }
    this.newSettingsForm = this.formBuilder.group({
      username: this.user?.username,
      firstName: this.user?.firstName,
      lastName: this.user?.lastName,
      address: this.user?.address,
      birthday: this.user?.birthday,

      email: this.user?.email,
      phoneNumber: this.user?.phoneNumber,

      grade: this.user?.grade,
      school: this.user?.school
    });

    this.newSettingsForm.controls['username'].disable();
  }

  showPersonalSettings(){
    if(this.checkCurrentSettingShown("personal")) return;
    console.log(this.currentSettingShown)
  }

  showSecretSettings() {
    if(this.checkCurrentSettingShown("secret")) return;
    console.log(this.currentSettingShown)
  }

  showAppSettings(){
    if(this.checkCurrentSettingShown("app")) return;
    console.log(this.currentSettingShown)
  }

  checkCurrentSettingShown(newSetting: string): boolean{
    if(this.currentSettingShown == newSetting){
      return true;
    }
    this.currentSettingShown = newSetting;
    return false;
  }

  newUserSettings: UserSettings | null = null;

  submitSettings(){
    this.newUserSettings = this.newSettingsForm?.value;
    if(!this.newUserSettings) return;

    this.newUserSettings.username = this.user!.username;

    this.userService.saveUserSettings(this.newUserSettings).subscribe({
      next: (data) => {
        this.user = <User>data
        this.storageService.saveUserData(this.user!);
        var saveTextElement = document.getElementById('save-text') as HTMLElement;
        saveTextElement.hidden = false;
        saveTextElement.innerText = "Erfolgreich gespeichert!";
        saveTextElement.style.color = "#476930"
      },
      error: e => {
        console.error(e)
        var saveTextElement = document.getElementById('save-text') as HTMLElement;
        saveTextElement.hidden = false;
        saveTextElement.innerText = "Speichern fehlgeschlagen.";
        saveTextElement.style.color = "#dc3545";
      }
    })
  }

  openProfileImageModal() {
    this.profilePictureModal.nativeElement.style.display = "flex";
  }
  closeProfileImageModal(){
    this.profilePictureModal.nativeElement.style.display = "none";
  }

  onImageUpload(event: Event){
    const uploadElement = document.getElementById("profile-picture-upload") as HTMLInputElement;

    const files = uploadElement.files as FileList;

    if (files.length > 0) {
      const _file = files[0]
      this.userService.uploadProfilePicture(_file).subscribe({
        next: data => {
          this.user = data as User;
          this.storageService.saveUserData(this.user);
          window.location.reload();
        },
        error: e => {
          console.error("Image could not be uploaded")
        }
      });
    }

    uploadElement.value = "";
  }
}
