export interface UserSettings {
  // This should not get sent from backend and is only for setting things new
  // e.g. personal information
  username: string;
  newPassword: string;

  newFirstName: string;
  newLastName: string;
  newBirthDay: Date;
  newAddress: Date;

  newPhoneNumber: string;
  newMail: string;

  newGrade: number;
  newSchool: string;

  newSubjects: string[];
}
