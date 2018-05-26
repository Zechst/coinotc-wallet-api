import { Component, OnInit } from '@angular/core';
import { AuthServiceFirebase } from "../../shared/security/auth.service";
import { Router} from "@angular/router";
import {FormControl, FormGroupDirective, NgForm, Validators, FormGroup, FormBuilder} from '@angular/forms';
import {ErrorStateMatcher} from '@angular/material/core';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
      const isSubmitted = form && form.submitted;
      return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
    }
  }

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

    emailFormControl = new FormControl('', [
        Validators.required,
        Validators.email,
    ]);

    passwordFormControl = new FormControl('', [
        Validators.required
      ]);

    matcher = new MyErrorStateMatcher();
    constructor(private fb:FormBuilder,
                    private authService: AuthServiceFirebase,
                    private router:Router) {

    }

    ngOnInit() {
    
    }

    signInWithGoogle() {
      console.log("social google login...");
      console.log("social google login...");
      this.authService.googleLogin().then((result)=>{
        console.log(result);
        //this.router.navigate([' ']);
      }).catch((error)=> console.log(error));
      console.log("social google login...");
    }


    login() {
      //this.spinnerService.show();
      const emailFormValue = this.emailFormControl.value;
      const passwordFormValue = this.passwordFormControl.value;
      
      this.authService.login(emailFormValue, passwordFormValue)
            .subscribe(
                (result) => {
                  console.log(result);
                  this.authService.setTokenIdToLocalstorage();
                  this.router.navigate(['home']);
                  /*
                  setTimeout(function() {
                      this.spinnerService.hide();
                      
                    }.bind(this), 4500);*/
                  
                }
            )
    }

} 