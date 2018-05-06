import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { ChangepasswordComponent } from './changepassword/changepassword.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [LoginComponent, ChangepasswordComponent]
})
export class SecurityModule { }
