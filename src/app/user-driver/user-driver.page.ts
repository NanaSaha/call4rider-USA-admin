import { Component, NgZone, OnInit, Renderer2 } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import {
  Platform,
  LoadingController,
  ActionSheetController,
} from "@ionic/angular";
import { UserService } from "../auth/user.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";

@Component({
  selector: "app-user-driver",
  templateUrl: "./user-driver.page.html",
  styleUrls: ["./user-driver.page.scss"],
})
export class UserDriverPage implements OnInit {
  loading: Promise<HTMLIonLoadingElement>;
  userdatas: any[];
  automaticClose: boolean = true;
  roleModel: string;
  selectedIndex: any;
  driver_selectedIndex: any;
  drivers: any;
  driver_list: any;
  driverDetails: any[];
  driver_id;
  ratings_from_rider;

  constructor(
    private userService: UserService,
    private renderer: Renderer2,
    private platform: Platform,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    private activatedRoute: ActivatedRoute,
    public actionSheetController: ActionSheetController,
    private driverSvr: DriverRegService
  ) {
    this.loading = this.loadingCtrl.create();
    this.roleModel = "user";
  }

  ngOnInit() {
    this.getAllDrivers();
  }

  refresh() {
    this.loadingCtrl
      .create({
        message: "Refreshing ...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.getAllDrivers();
        loadingEl.dismiss();
      });
  }

  getAllDrivers() {
    this.loadingCtrl
      .create({
        message: "Updating...",
      })
      .then((loadingEl) => {
        loadingEl.present();

        this.driverSvr.getDrivers().subscribe(
          (res) => {
            console.log("RESPONSE FROM DRIVERS" + JSON.stringify(res));
            this.driver_list = res;
            this.drivers = res.map((item) => (item = { ...item, open: false }));
            console.log("SHOWIN ALL DRIVERS!! " + JSON.stringify(this.drivers));

            console.log("DRIVER UID" + this.drivers[0].uid);
            console.log("DRIVER ID" + this.drivers[0].id);

            this.driver_id = this.drivers[0].id

            console.log("DRIVER LEnght" + this.drivers.length);

            this.driverDetails = this.drivers[3];

            console.log("DRIVER DETAILS:: " + JSON.stringify(this.drivers[0]));

            this.driverSvr.getDriverRatings(this.driver_id).subscribe((details) => {
              console.log("RESPONSE FROM DRIVERS" + JSON.stringify(details));
              this.ratings_from_rider = details;
            }, (err) => {
              loadingEl.dismiss();
              console.log(err);
            });
          },

          (err) => {
            loadingEl.dismiss();
            console.log(err);
          }
        );


        loadingEl.dismiss();
      });
  }

  toggleSelectionDrivers(index) {
    this.driver_selectedIndex = index;
    console.log("SELECTED INDEX:: " + this.driver_selectedIndex);
    this.drivers[index].open = !this.drivers[index].open;
    if (this.drivers[index].open) {
      this.drivers
        .filter((item, itemIndex) => itemIndex != index)
        .map((item) => (item.open = false));
    }
  }

  onSelectChangeDriver(event, item, index) {
    console.log(event.detail.value);
    console.log(item);
    this.driver_selectedIndex = index;
    console.log("SELECTED INDEX:: " + this.driver_selectedIndex);
    let status: string;
    if (event.detail.value === "verified") {
      status = "verified";
      console.log("STATUS SELECT::" + status);
      // item.roles.admin = true;
    } else {
      // item.roles.admin = false;
      status = "unverified";
      console.log("STATUS SELECT::" + status);
    }
    this.loadingCtrl
      .create({
        message: "Updating Status...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        console.log("ITEM & STATUS:: " + item, status);
        this.driverSvr.updateDriverStatus(item, status).then(
          (res) => {
            console.log(JSON.stringify(res));
            console.log("DRIVERS LIST:: " + this.drivers);
            console.log("SELECTED INDEX:: " + this.driver_selectedIndex);
            console.log(
              "drivers DATA INDEX",
              this.drivers[this.driver_selectedIndex]
            );
            console.log(
              "drivers SELECTED INDEX STATUS:::: ",
              this.drivers[this.driver_selectedIndex].status
            );
            this.drivers[this.driver_selectedIndex].status = status;
            console.log(
              "drivers SELECTED INDEX STATUS AFTER:::: ",
              this.drivers[this.driver_selectedIndex].status
            );
            loadingEl.dismiss();
          },
          (err) => {
            console.log(err);
            loadingEl.dismiss();
          }
        );
      });
  }

  //
}
