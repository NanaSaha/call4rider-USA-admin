import { Component, ViewChild, ElementRef, OnInit } from "@angular/core";
import {
  NavController,
  NavParams,
  ModalController,
  AlertController,
} from "@ionic/angular";
import { DriverRegService } from "../driver-registration/driver-reg.service";

import { ActivatedRoute } from "@angular/router";
import { NavigationExtras, Router } from "@angular/router";

@Component({
  selector: "app-rate",
  templateUrl: "./rate.page.html",
  styleUrls: ["./rate.page.scss"],
})
export class RatePage implements OnInit {
  @ViewChild("myInput", { static: true }) myInput: ElementRef;
  public rateNumber: any;
  todo = {
    description: "",
  };
  rate;
  lat: any;
  lng: any;
  cartype: any;
  map: any;
  information: any;
  ride: any;
  distance: any;
  directionsService: any;
  directionsDisplay = new google.maps.DirectionsRenderer();
  driver: any;
  message: any;
  driverId: any = 0;
  latitude: number;
  longitude: number;
  address: any;
  new_driver_id;
  driverDATAid;
  constructor(
    public navCtrl: NavController,

    private activatedRoute: ActivatedRoute,
    private router: Router,
    private alertCtrl: AlertController,
    public modal: ModalController,
    private driverSvr: DriverRegService
  ) {
    this.lat = this.activatedRoute.snapshot.paramMap.get("lat");
    this.lng = this.activatedRoute.snapshot.paramMap.get("lng");
    this.cartype = this.activatedRoute.snapshot.paramMap.get("cartype");
  }

  async ionViewWillEnter() {
    await this.modal.dismiss(false);
  }

  onModelChange($event) {
    this.rateNumber = $event;
  }

  onRateChange($event) {
    this.rateNumber = $event;
    console.log("RATING NUMBER__-->>", this.rateNumber);
  }

  logForm() {
    console.log(this.todo);
    if (this.rateNumber != null) {
      console.log(this.rateNumber);
      this.showAlert();

      this.driverSvr.rideEnded(this.driverDATAid, false).then(
        (res) => {
          console.log("RESPONSE FROM DRIVERS" + JSON.stringify(res));
        },
        (err) => {
          console.log("ERROR DRIVER", err);
        }
      );

      this.router.navigateByUrl("/ride-requests");
    } else {
      this.showAlert();
      this.driverSvr.rideEnded(this.driverDATAid, false).then(
        (res) => {
          console.log("RESPONSE FROM DRIVERS" + JSON.stringify(res));
        },
        (err) => {
          console.log("ERROR DRIVER", err);
        }
      );
      this.router.navigateByUrl("/ride-requests");
    }
  }

  private showAlert() {
    this.alertCtrl
      .create({
        header: "RATED",
        message: "Driver has been rated",
        buttons: ["Okay"],
      })
      .then((alertEl) => alertEl.present());
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe(
      (params) => {
        if (params && params.message && params.driver_main_id) {
          this.driverDATAid = JSON.parse(params.driver_main_id);

          console.log(params.driver_main_id);
          console.log("MESSAGES:::", this.driverDATAid);
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
