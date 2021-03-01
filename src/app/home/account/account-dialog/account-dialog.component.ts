import { ErrorResponse, Users, method } from './../../../model/model.model';
import { environment } from './../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from 'src/app/login/login.component';
import { MustMatch } from 'src/assets/matchCheck';

@Component({
  selector: 'app-account-dialog',
  templateUrl: './account-dialog.component.html',
  styleUrls: ['./account-dialog.component.scss'],
})
export class AccountDialogComponent implements OnInit {
  accountAddForm: FormGroup;

  errorRes: ErrorResponse;

  matcher = new MyErrorStateMatcher();
  dataDialog: method;
  user: Users;
  check = true;
  passwordView = true;
  header = 'เพิ่มบัญชีผู้ใช้งาน';
  forbiddenUsernames = ['admin'];

  userAlready = true;

  constructor(
    private formBuilder: FormBuilder,

    private http: HttpClient,
    public dialogRef: MatDialogRef<AccountDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: method
  ) {}

  ngOnInit(): void {
    this.createForm();
    this.dataDialog = this.data;

    if (this.data.method === 'editAccount') {
      this.accountAddForm.patchValue(this.data.user);
      this.check = false;
      this.passwordView = false;
      this.header = 'แก้ไขบัญชีผู้ใช้งาน';
    }
  }

  createForm(): void {
    this.accountAddForm = this.formBuilder.group(
      {
        firstname: ['', Validators.required],
        lastname: ['', Validators.required],
        phone_number: [
          '',
          [
            Validators.compose([
              Validators.required,
              Validators.minLength(9),
              Validators.maxLength(10),
              Validators.pattern('[0][0-9]{9}'),
            ]),
          ],
        ],
        staff_id: ['', Validators.required],
        username: ['', [Validators.required]],
        password: [null, [Validators.minLength(8)]],
        password_confirmation: [null],
      },
      {
        validators: [MustMatch('password', 'password_confirmation')],
      }
    );
  }

  editPass(): void {
    this.passwordView = !this.passwordView;
  }

  onSubmit(): void {
    if (this.data.method !== 'editAccount') {
      if (this.accountAddForm.invalid) {
        return;
      }
      let body = {
        firstname: this.accountAddForm.getRawValue().firstname,
        lastname: this.accountAddForm.getRawValue().lastname,
        phone_number: this.accountAddForm.getRawValue().phone_number,
        staff_id: this.accountAddForm.getRawValue().staff_id,
        username: this.accountAddForm.getRawValue().username,
        password: this.accountAddForm.getRawValue().password,
        password_confirmation: this.accountAddForm.getRawValue()
          .password_confirmation,
      };

      this.http.post(`${environment.apiUrl}users`, { user: body }).subscribe(
        (res) => {
          console.log('Add Account success!!');
          this.dialogRef.close();
        },
        (error) => {
          this.accountAddForm.controls['username'].setErrors({
            userAlready: true,
          });
        }
      );
    } else if (this.data.method === 'editAccount') {
      if (this.accountAddForm.invalid) {
        return;
      }
      let body = {};

      if (this.accountAddForm.getRawValue().password !== null) {
        body = {
          firstname: this.accountAddForm.getRawValue().firstname,
          lastname: this.accountAddForm.getRawValue().lastname,
          phone_number: this.accountAddForm.getRawValue().phone_number,
          staff_id: this.accountAddForm.getRawValue().staff_id,
          username: this.accountAddForm.getRawValue().username,
          password: this.accountAddForm.getRawValue().password,
        };
      } else {
        body = {
          firstname: this.accountAddForm.getRawValue().firstname,
          lastname: this.accountAddForm.getRawValue().lastname,
          phone_number: this.accountAddForm.getRawValue().phone_number,
          staff_id: this.accountAddForm.getRawValue().staff_id,
          username: this.accountAddForm.getRawValue().username,
        };
      }

      this.http
        .put(`${environment.apiUrl}users/` + this.data.user.id, {
          user: body,
        })
        .subscribe(
          (res) => {
            console.log('Update Account success!!');
            this.dialogRef.close();
          },
          (error) => {
            this.accountAddForm.controls['username'].setErrors({
              userAlready: true,
            });
          }
        );
    }
  }

  close(): void {
    this.dialogRef.close();
  }
}
