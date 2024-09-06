import { NavigationExtras, Router } from "@angular/router";
import { AuthService } from "./auth/auth.service";
import {
  Component,
  OnInit,
  OnDestroy,
  Host,
  HostListener,
} from "@angular/core";

import { Platform } from "@ionic/angular";
import {
  Plugins,
  Capacitor,
  PushNotification,
  PushNotificationToken,
  PushNotificationActionPerformed,
} from "@capacitor/core";

import { Subscription } from "rxjs";
import { UserService } from "./auth/user.service";
import { UserRecord } from "./auth/userrecord.model";
import { AngularFireMessaging } from "@angular/fire/messaging";
import { MessagingService } from "./services/messaging.service";
import { ScreensizeService } from "./services/screensize.service";
import { StoreService } from "./services/store.service";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { Uid } from "@ionic-native/uid/ngx";
import { UniqueDeviceID } from "@ionic-native/unique-device-id/ngx";
import { DeviceService } from "./services/device.service";
import { DriverRegService } from "./driver-registration/driver-reg.service";

// const { PushNotifications, Device } = Plugins;
import OneSignal from "onesignal-cordova-plugin";

// import { Plugins } from '@capacitor/core';

// const {  } = Plugins;

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;
  user: UserRecord;
  fullName: string;
  selectedImage: string;
  defailtImage: string = "assets/image/profile.png";
  message;
  isDesktop;
  adminMenuAllowed: boolean;
  isDriver: boolean = false;
  UniqueDeviceID: string;
  userId: string;
  authenticated: boolean = false;

  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private screensizeService: ScreensizeService,
    private _StoreService: StoreService,
    private _DeviceService: DeviceService,
    private driverSvr: DriverRegService
  ) {
    this.adminMenuAllowed = true;
    console.log("ADMIN TRUE-->>");
    this.initializeApp();

    this.screensizeService.isDesktopView().subscribe((isDesktop) => {
      console.log("Is destop changed:", isDesktop);
      this.isDesktop = isDesktop;
    });
  }

  async initializeApp() {
    this.platform.ready().then(() => {
      if (Capacitor.isPluginAvailable("SplashScreen")) {
        Plugins.SplashScreen.hide();
      }

      this.screensizeService.onResize(this.platform.width());
      this.setupPush();
    });

    this.platform.resume.subscribe(async () => {
      this.authService.refreshToken2().subscribe(
        (result) => {
          this.authenticateUser();
        },
        (err) => {
          console.log(err);
        }
      );
    });
  }

  setupPush() {
    console.log("RUNNING FIRST PUSH NOTIF");
    // NOTE: Update the setAppId value below with your OneSignal AppId.
    OneSignal.setAppId("1393d418-3ab0-4829-927f-92d31bf806e1");
    OneSignal.setNotificationOpenedHandler(function (jsonData) {
      console.log("notificationOpenedCallback: " + JSON.stringify(jsonData));
    });
    // iOS - Prompts the user for notification permissions.
    //    * Since this shows a generic native prompt, we recommend instead using an In-App Message to prompt for notification permission (See step 6) to better communicate to your users what notifications they will get.
    OneSignal.promptForPushNotificationsWithUserResponse(function (accepted) {
      console.log("User accepted notifications: " + accepted);
    });
  }

  async ngOnInit() {
    this.selectedImage = this.defailtImage;
    await this._StoreService.init();

    // this.authenticateUser();
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {

      console.log("AUTH FUNCTIONN--lpkljkk----")
      Plugins.Storage.get({ key: "loginShown" }).then((shown) => {

        if (shown !== null && shown !== undefined && shown.value == "yes") {
          console.log("GOIN DASHBOARD--")
          this.router.navigateByUrl("/ride-requests");
        } else {
          console.log("GOIN to AUTHENT--")
          this.authenticateUser();
        }
      })
    });
  }

  private authenticateUser() {
    this.authSub = this.authService.userIsAuthenticated.subscribe((isAuth) => {
      if (isAuth) {
        this.authenticated = true

        this.router.navigateByUrl("/ride-requests");
        // this.deviceCheck();
      } else {
        this.authenticated = false
        // this.router.navigateByUrl("/auth");
        this.router.navigateByUrl("/entrance");
      }
    });
  }

  // private deviceCheck() {
  //   Plugins.Storage.get({ key: "device_id" }).then(
  //     (uuid) => {
  //       if (uuid !== null && uuid !== undefined) {
  //         this._DeviceService
  //           .iSDeviceRegistered(uuid.value)
  //           .subscribe((device) => {

  //             if (
  //               device !== null &&
  //               device !== undefined &&
  //               device.length > 0
  //             ) {
  //               this.router.navigateByUrl("/phone-signin");

  //             } else {
  //               this.router.navigateByUrl("/phone-signin");
  //             }
  //           });
  //       } else {
  //         this.router.navigateByUrl("/phone-signin");
  //       }
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }

  menuOpened() {
    this.userService.getUserByUserId().subscribe((userdatas) => {
      if (userdatas.length > 0) {
        let userdata = userdatas[0];
        this.user = userdata;
        this.fullName = userdata.firstName + " " + userdata.lastName;
        console.log("USERDATAS:::", userdatas);
        console.log("USERDATAS ID:::", userdata.userId);

        if (userdata.imageUrl) {
          this.selectedImage = userdata.imageUrl;
        } else {
          this.selectedImage = this.defailtImage;
        }
        if (userdata.roles.admin) {
          this.adminMenuAllowed = true;
          console.log("ADMIN TRUE-->>");
        } else {
          this.adminMenuAllowed = false;
          console.log("ADMIN FALSE-->>");
        }
        console.log(userdata);
      }
    });
  }
  menuClosed() { }
  onLogout() {
    Plugins.Storage.remove({ key: "loginShown" });
    this.authService.logout();
  }

  ngOnDestroy(): void {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  async storeAppToken(appToken: string): Promise<void> {
    if (this._StoreService.isService) {
      // open the data storage
      let result: any = await this._StoreService.openStore();
      console.log("storage retCreate result", result);
      if (result) {
        await this._StoreService.clear();
        // store data in the first store
        await this._StoreService.setItem("apptoken", appToken);
        result = await this._StoreService.getItem("session");
        console.log("result ", result);
      }
    } else {
      console.log("CapacitorDataStorageSqlite Service is not initialized");
    }
  }

  async storeDeviceInfo(deviceId: any): Promise<void> {
    if (this._StoreService.isService) {
      // open the data storage
      let result: any = await this._StoreService.openStore();
      console.log("storage retCreate result", result);
      if (result) {
        await this._StoreService.clear();
        // store data in the first store
        await this._StoreService.setItem("deviceId", deviceId);
        result = await this._StoreService.getItem("session");
        console.log("result ", result);
      }
    } else {
      console.log("CapacitorDataStorageSqlite Service is not initialized");
    }
  }

  @HostListener("window:resize", ["$event"])
  private onResize(event) {
    this.screensizeService.onResize(event.target.innerWidth);
  }





}
