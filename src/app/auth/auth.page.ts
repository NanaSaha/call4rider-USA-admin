import { Component, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { LoadingController, AlertController } from "@ionic/angular";
import { Observable } from "rxjs";
import { Plugins } from "@capacitor/core";

import { AuthService, AuthResponseData } from "../auth/auth.service";
import { DeviceService } from "../services/device.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";
import { NavigationExtras, Router } from "@angular/router";

const { Device } = Plugins;

@Component({
  selector: "app-auth",
  templateUrl: "./auth.page.html",
  styleUrls: ["./auth.page.scss"],
})
export class AuthPage implements OnInit {
  isLoading = false;
  isLogin = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private _DeviceService: DeviceService,
    private driverSvr: DriverRegService
  ) { }

  ngOnInit() { }

  async authenticate(email: string, password: string) {
    const info = await Device.getInfo();
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: "Logging in..." })
      .then((loadingEl) => {
        loadingEl.present();
        let authObs: Observable<AuthResponseData>;
        authObs = this.authService.login(email, password);

        authObs.subscribe(
          (resData) => {
            console.log(resData);
            this.isLoading = false;
            loadingEl.dismiss();

            //this.router.navigateByUrl("/phone-signin");
            // this.router.navigateByUrl("/ride-requests");
            // let navigationExtras: NavigationExtras = {
            //   queryParams: {
            //     email: email,

            //   },
            // };


            //this.router.navigate(["/phone-signin"], navigationExtras);
            this.deviceCheck(info.uuid, email);
          },
          (errRes) => {
            loadingEl.dismiss();
            const code = errRes.error.error.message;
            let message = "Could not sign you up, please try again.";
            if (code === "EMAIL_EXISTS") {
              message = "This email address exists already!";
            } else if (code === "EMAIL_NOT_FOUND") {
              message = "E-Mail address could not be found.";
            } else if (code === "INVALID_PASSWORD") {
              message = "This password is not correct.";
            }
            this.showAlert(message);
          }
        );
      });
  }

  private deviceCheck(uuid: any, email) {
    console.log("RUUNIN CHECK DEVICE");
    let navigationExtras: NavigationExtras = {
      queryParams: {
        email: email,

      },
    };
    Plugins.Storage.get({ key: "device_id" }).then(
      (uuid) => {
        if (uuid !== null && uuid !== undefined) {
          this._DeviceService
            .iSDeviceRegistered(uuid.value)
            .subscribe((device) => {
              // alert(device);
              if (
                device !== null &&
                device !== undefined &&
                device.length > 0
              ) {
                this.router.navigateByUrl("/ride-requests");
                //this.router.navigateByUrl("/phone-signin");
              } else {
                this.router.navigate(["/phone-signin"], navigationExtras);
              }
            });
        } else {
          this.router.navigate(["/phone-signin"], navigationExtras);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }


  onSwitchAuthMode() {
    this.router.navigateByUrl("/setup");
  }

  onSubmit(form: NgForm) {
    if (!form.valid) {
      return;
    }
    const email = form.value.email;
    const password = form.value.password;
    this.authenticate(email, password);
    // this.router.navigateByUrl("/ride-requests");
  }

  private showAlert(message: string) {
    this.alertCtrl
      .create({
        header: "Authentication failed",
        message: message,
        buttons: ["Okay"],
      })
      .then((alertEl) => alertEl.present());
  }
}
