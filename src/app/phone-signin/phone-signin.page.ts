import { Component, NgZone, OnDestroy, OnInit } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";

import { WindowService } from "../services/window.service";
import { AlertController } from "@ionic/angular";
// import * as firebase from 'firebase';
import * as firebaseui from "firebaseui";
import * as firebase from "firebase";
import { UserService } from "../auth/user.service";
import { Platform } from "@ionic/angular";
import { DeviceService } from "../services/device.service";
import { Device, Plugins } from "@capacitor/core";
import { ActivatedRoute, NavigationExtras } from "@angular/router";

export class PhoneNumber {
  country: string;
  area: string;
  prefix: string;
  line: string;

  // format phone numbers as E.164
  get e164() {
    const num = this.country + this.area + this.prefix + this.line;
    return `+${num}`;
  }
}

@Component({
  selector: "app-phone-signin",
  templateUrl: "./phone-signin.page.html",
  styleUrls: ["./phone-signin.page.scss"],
})
export class PhoneSigninPage implements OnInit, OnDestroy {
  windowRef: any;

  phoneNumber = new PhoneNumber();

  verificationCode: string;
  phone: any;
  email: any;
  user: any;
  ui: firebaseui.auth.AuthUI;
  uiConfig: firebaseui.auth.Config;
  constructor(
    private win: WindowService,
    private afAuth: AngularFireAuth,
    private router: Router,
    private ngZone: NgZone,
    private _userService: UserService,
    private platform: Platform,
    private _DeviceService: DeviceService,
    private activatedRoute: ActivatedRoute,
    private alertCtrl: AlertController,
  ) { }

  ngOnDestroy(): void {
    this.ui.delete();
  }

  ngOnInit() {

    this.activatedRoute.queryParams.subscribe(
      (params) => {
        if (
          params &&
          params.email
        ) {
          this.email = params.email;
          console.log("NEW SIGNUP:::" + this.email);


          this._userService.getUserByEmail(this.email).subscribe((user) => {
            console.log("PHONE NUMBER EXIST" + JSON.stringify(user))
            if (user.length > 0) {

              this.phone = user[0].phone
              console.log("PHONE FROM DB -->> " + user[0].phone)
              console.log("PHONE NYUMBER IS ---<<<< " + this.phone)


              this.uiConfig = {


                signInOptions: [
                  {
                    provider: firebase.auth.PhoneAuthProvider.PROVIDER_ID,
                    defaultCountry: 'US',
                    defaultNationalNumber: this.phone,


                  }
                ],
                callbacks: {
                  signInSuccessWithAuthResult: this.onLoginSuccessful.bind(this),
                  signInFailure: this.onSignInFailure.bind(this)
                }
              };
              this.ui = new firebaseui.auth.AuthUI(firebase.auth());
              this.ui.start('#firebaseui-auth-container', this.uiConfig);

            }

          })

        }
      },
      (err) => {
        console.log(err);
      }
    );




  }

  onSignInFailure() {
    throw new Error("Method not implemented.");
  }
  onLoginSuccessful(result) {
    console.log("Phone Result ", result.user.phoneNumber);
    console.log("Phone Result FROM DB ", this.phone);
    this.ngZone.run(() => {


      Device.getInfo().then(
        (device) => {
          if (device !== null) {
            this._DeviceService.getDeviceInfoByDeviceId(device.uuid).subscribe(
              (deviceInfo) => {
                if (deviceInfo.length === 0) {
                  this._DeviceService
                    .registerDevice(device.uuid, result.user.phoneNumber)
                    .then(
                      (result) => {
                        console.log(result);
                        // alert("Your platform is: " + device.uuid)
                        Plugins.Storage.set({
                          key: "device_id",
                          value: device.uuid,
                        });
                      },
                      (error) => console.log
                    );
                }
              },
              (err) => console.log
            );
          }
        },
        (err) => console.log
      );
      if (this.phone == result.user.phoneNumber) {
        this._userService
          .getUserByPhoneNumber(this.phone)
          .subscribe((user) => {
            console.log("ADMIN-->>" + user)
            console.log("ADMIN-->>" + user[0].roles.admin)
            if (user.length > 0 && user[0].roles.admin) {
              this.router.navigateByUrl("/ride-requests");
            } else {
              this.showAlert("Account is not an admin");
              this.router.navigateByUrl("/auth");
            }
          });
      }
      else {
        this.showAlert("PHONE NUMBER NOT ASSOCIATED WITH ACCOUNT");
        this.router.navigateByUrl('/auth')
        console.log("PHONE NUMBER NOT ASSOCIATED WITH ACCOUNT")
      }
    });
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({

        message: message,
        buttons: ["Okay"],
      })
      .then((alertEl) => alertEl.present());
  }

  // sendLoginCode() {

  //   const appVerifier = this.windowRef.recaptchaVerifier;

  //   const num = this.phoneNumber.e164;

  //   firebase.auth().signInWithPhoneNumber(num, appVerifier)
  //           .then(result => {

  //               this.windowRef.confirmationResult = result;

  //           })
  //           .catch( error => console.log(error) );

  // }

  // verifyLoginCode() {
  //   this.windowRef.confirmationResult
  //                 .confirm(this.verificationCode)
  //                 .then( result => {

  //                   this.user = result.user;

  //   })
  //   .catch( error => console.log(error, "Incorrect code entered?"));
  // }
}
