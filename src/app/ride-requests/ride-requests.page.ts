import { HIGH_CONTRAST_MODE_ACTIVE_CSS_CLASS } from "@angular/cdk/a11y/high-contrast-mode/high-contrast-mode-detector";
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import {
  Platform,
  LoadingController,
  ActionSheetController,
} from "@ionic/angular";
import { UserService } from "../auth/user.service";
import { FcmMessagingService } from "../services/fcm-messaging.service";
import { RideRequestsService } from "./ride-requests.service";


// const sortArray = require('sort-array')

@Component({
  selector: "app-ride-requests",
  templateUrl: "./ride-requests.page.html",
  styleUrls: ["./ride-requests.page.scss"],
})
export class RideRequestsPage implements OnInit, AfterViewInit {
  @ViewChild("map", { static: false }) mapElementRef: ElementRef;
  map: any;
  locationItems: any;
  directionsService: any;
  directionsDisplay = new google.maps.DirectionsRenderer();
  loading: any;
  data: any;
  distance: any = "15 KM";
  fare: any;
  ride: any;
  userId: string;
  showLoader = false;
  showOnMap = false;
  myDate: string = new Date().toISOString();
  isDeleteJob = false;

  information: any[];
  old_information: any[];
  automaticClose: boolean = true;
  isLoading: boolean;
  public items: any;
  userdataWithOnesig
  overall_list: string = "new";
  constructor(
    private rideRequestsService: RideRequestsService,
    private renderer: Renderer2,
    private platform: Platform,
    public zone: NgZone,
    public loadingCtrl: LoadingController,
    private activatedRoute: ActivatedRoute,
    public actionSheetController: ActionSheetController,
    private router: Router,
    private fcmSer: FcmMessagingService,
    private userService: UserService,
  ) {
    this.loading = this.loadingCtrl.create();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
    this.platform.ready().then(() => {
      //this.UpdateUserDataWithOnesignal();
    })


  }

  refresh() {
    this.loadingCtrl
      .create({
        message: "Refreshing ...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.ngOnInit();
        loadingEl.dismiss();
      });
  }

  ngOnInit() {
    this.retrieveUserDetails();
    this.fetchRides();
    this.fetchOldRides();

    // this.createMap(-34.397, 150.644);
  }

  private fetchRides() {
    this.information = [];
    this.rideRequestsService.ridesRequestsCollectionFetch().subscribe(
      (ride) => {
        console.log("Show Ride information " + JSON.stringify(ride));
        this.information = ride
          .filter((item) => item.user != null)
          .map(
            (item) =>
            (item = {
              ...item,
              open: false,
              distance: "",
              tripeTime: new Date(item.time),
            })
          );
        if (this.information.length > 0) {
          this.zone.run(() => {
            this.information[0].open = true;
            this.createMap(-34.397, 150.644);
            this.calculateAndDisplayRoute(
              this.information[0].startAddress,
              this.information[0].endAddress,
              this.information[0].tripDate,
              this.information[0].time,
              0
            );
          });

          // ride.forEach((snap) => {
          //   console.log(
          //     "INFORMTION FROM RIDE " + JSON.stringify(snap)
          //   );
          //   console.log(
          //     "INFORMTION FROM RIDE new_ride_status " + JSON.stringify(snap.new_ride_status)
          //   );
          //   console.log(
          //     "INFORMTION FROM RIDE ID  " + JSON.stringify(snap.id)
          //   );
          //   this.items = [];
          //   if (snap.new_ride_status && snap.id) {
          //     this.items.push({
          //       id: snap.id,
          //       new_ride_status: snap.new_ride_status,
          //     });

          //     this.rideRequestsService.updateRideStatus(snap.id, false)
          //     this.items;
          //     console.log("new_ride_status ITEM LISTSS::: ", this.items);
          //   } else {
          //     console.log("new_ride_status IS UNDEFINED");
          //   }
          // });

          // console.log("ABOUT TO LOOP:::" + this.userdataWithOnesig);
          // this.userdataWithOnesig.forEach((snap) => {
          //   let onesignal_id = snap.onesignal_id
          //   console.log("ONSEIGNAL ID IS " + onesignal_id);

          //   if (this.items.length > 0) {
          //     var notificationObj = {
          //       contents: {
          //         en: "New RIDE REquest Booked",
          //       },
          //       include_player_ids: [onesignal_id],
          //     };
          //     (window as any).plugins.OneSignal.postNotification(
          //       notificationObj,
          //       function (successResponse) {
          //         console.log("Notification Post Success:" + successResponse);
          //       },
          //       function (failedResponse) {
          //         console.log("Notification Post Failed: " + failedResponse);

          //       }
          //     );
          //   }

          // })


        }


        console.log(this.information);
      },
      (err) => {
        console.log(err);
      }
    );
  }




  private fetchOldRides() {
    this.old_information = [];
    this.rideRequestsService.oldridesRequestsCollectionFetch().subscribe(
      (ride) => {
        console.log("Show Ride information " + JSON.stringify(ride));
        this.old_information = ride
          .filter((item) => item.user != null)
          .map(
            (item) =>
            (item = {
              ...item,
              open: false,
              distance: "",
              tripeTime: new Date(item.time),
            })
          );
        if (this.old_information.length > 0) {
          this.zone.run(() => {
            this.old_information[0].open = true;
            this.createMap(-34.397, 150.644);
            this.calculateAndDisplayRoute(
              this.old_information[0].startAddress,
              this.old_information[0].endAddress,
              this.old_information[0].tripDate,
              this.old_information[0].time,
              0
            );
          });


        }


        console.log(this.old_information);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  validateCheck(event, data) {
    // console.log(event)
    // console.log(data);
    if (this.isDeleteJob && data !== null && data !== undefined) {
      this.rideRequestsService.deleteRide(data.id).then(
        (ride) => {
          this.fetchRides();
        },
        (err) => {
          console.log(err);
        }
      );
    }
    //this.isDeleteJob = false;
  }

  dateFilterchanged(event) {
    console.log(this.myDate);
    //console.log("dateEventObject=>"+ event);
    this.rideRequestsService
      .ridesRequestsCollectionFetch(this.myDate)
      .subscribe(
        (ride) => {
          console.log(ride);
          this.information = ride
            .filter((item) => item.user != null)
            .map(
              (item) =>
              (item = {
                ...item,
                open: false,
                distance: "",
                tripeTime: new Date(item.time),
              })
            );
          if (this.information.length > 0) {
            console.log("Tripe Time " + this.information[0].tripeTime);
            this.zone.run(() => {
              this.information[0].open = true;
              this.createMap(-34.397, 150.644);
              this.calculateAndDisplayRoute(
                this.information[0].startAddress,
                this.information[0].endAddress,
                this.information[0].tripDate,
                this.information[0].time,
                0
              );
            });
          }
          console.log(this.information);
        },
        (err) => {
          console.log(err);
        }
      );
  }

  toggleSelection(index) {
    this.information[index].open = !this.information[index].open;
    if (this.automaticClose && this.information[index].open) {
      this.information
        .filter((item, itemIndex) => itemIndex != index)
        .map((item) => (item.open = false));
    }
    this.createMap(-34.397, 150.644);
    this.calculateAndDisplayRoute(
      this.information[0].startAddress,
      this.information[0].endAddress,
      this.information[0].tripDate,
      this.information[0].time,
      index
    );
  }



  oldtoggleSelection(index) {
    this.old_information[index].open = !this.old_information[index].open;
    if (this.automaticClose && this.old_information[index].open) {
      this.old_information
        .filter((item, itemIndex) => itemIndex != index)
        .map((item) => (item.open = false));
    }
    this.createMap(-34.397, 150.644);
    this.calculateAndDisplayRoute(
      this.old_information[0].startAddress,
      this.old_information[0].endAddress,
      this.old_information[0].tripDate,
      this.old_information[0].time,
      index
    );
  }

  ngAfterViewInit() {
    this.createMap(-34.397, 150.644);
    // this.calculateAndDisplayRoute(
    //   this.information[0].startAddress,
    //   this.information[0].endAddress,
    //   this.information[0].tripDate,
    //   this.information[0].time
    // );
  }

  viewOnMap(item, index) {
    this.showOnMap = true;
    console.log(item);
    this.createMap(-34.397, 150.644);
    this.calculateAndDisplayRoute(
      item.startAddress,
      item.endAddress,
      item.tripDate,
      item.time,
      index
    );
    // this.information[index].distance = this.distance;
  }

  createMap(lat: number, lng: number) {
    this.getGoogleMaps()
      .then((googleMaps) => {
        const mapEl = this.mapElementRef.nativeElement;
        const map = new googleMaps.Map(mapEl, {
          center: { lat: lat, lng: lng },
          zoom: 8,
        });

        googleMaps.event.addListenerOnce(map, "idle", () => {
          this.renderer.addClass(mapEl, "visible");
        });

        map.addListener("click", (event) => {
          // const selectedCoords = {
          //   lat: event.latLng.lat(),
          //   lng: event.latLng.lng(),
          // };
          //this.modalCtrl.dismiss(selectedCoords);
        });

        this.directionsDisplay.setMap(map);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://maps.googleapis.com/maps/api/js?key=AIzaSyC2V-j8HkCCRNRHkdBieVOjsG1uVnLZRZE";
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject("Google maps SDK not available.");
        }
      };
    });
  }

  calculateAndDisplayRoute(
    source: string,
    destination: string,
    tripDate: Date,
    time: number,
    index: number
  ) {
    console.log("tripe date" + tripDate);
    const that = this;
    this.directionsService.route(
      {
        origin: source,
        destination: destination,
        travelMode: "DRIVING",
      },
      (response, status) => {
        if (status === "OK") {
          console.log(response);
          that.distance = response.routes[0].legs[0].distance.text;
          this.information[index].distance = that.distance;
          if (
            that.distance.split(" ")[0] !== undefined &&
            that.distance.split(" ")[0] !== null
          ) {
            console.log(that.distance.split(" ")[0]);
          }

          const startlocation = response.routes[0].legs[0].start_location;
          const endlocation = response.routes[0].legs[0].end_location;

          that.directionsDisplay.setDirections(response);
        } else {
          //window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

  assignJob(item) {
    console.log(item);
    let navigationExtras: NavigationExtras = {
      queryParams: {
        job: JSON.stringify(item),
      },
    };
    this.router.navigate(["job"], navigationExtras);
  }

  onSelectChange(value, item) {
    console.log(value.detail.value);
    console.log(item);
    this.isLoading = true;
    this.loadingCtrl
      .create({ keyboardClose: true, message: "Updating ride..." })
      .then((loadingEl) => {
        loadingEl.present();
        item.approveRide = false;
        if (value.detail.value === "approve") {
          item.approveRide = true;
          if (item.appToken !== "") {
            // const fcmData = {
            //   notification: {
            //     title: "Call For Ride",
            //     body: "",
            //     sound: "default",
            //     click_action: "FCM_PLUGIN_ACTIVITY",
            //     icon: "./../../assets/images/logos/arabic-purpal-logo.png",
            //   },
            //   data: {
            //     Message:
            //       "Your ride has been approved. its being assigned to a driver",
            //     status: "approval",
            //     driverId: "",
            //     rideId: ` ${item.id}`,
            //   },
            //   to: `${item.appToken}`,
            // };
            // this.fcmSer.sendNotification(fcmData).subscribe(
            //   (result) => {
            //     console.log(result);
            //   },
            //   (err) => {
            //     console.log(err);
            //   }
            // );
          }
        }
        this.rideRequestsService.updateRidesRequest(item).then(
          (res) => {
            loadingEl.dismiss();
          },
          (err) => {
            loadingEl.dismiss();
          }
        );
      });
  }


  UpdateUserDataWithOnesignal() {
    console.log("UPDATING DATA WITH ONESIGNAL");
    this.userService.getUserByUserId().subscribe((userdatas) => {
      if (userdatas.length > 0) {
        let userdata = userdatas[0];

        console.log("USERDATAS:::" + userdatas);
        console.log("USERDATAS ID:::" + userdata.id);
        console.log(userdata);

        (window as any).plugins.OneSignal.getDeviceState(function (stateChanges) {

          console.log("USER ONESIGNAL ID-->: " + stateChanges.userId);

          if (stateChanges.userId) {
            this.userService
              .updateUserWithOnesignalId(userdata.id, stateChanges.userId)
              .then(
                (res) => {
                  console.log(res);

                },
                (err) => {
                  console.log(err);

                }
              );
          }
          else {
            console.log("ONESIGNAL ID SOESNT EXIST");
          }


        });
      }

      else {
        console.log("USER DOESNT EXIST");
      }
    });
  }


  retrieveUserDetails() {
    this.userService.getUserByUserId().subscribe((userdatas) => {

      this.userdataWithOnesig = userdatas
      console.log("USERDATAS with onesignale:::" + JSON.stringify(this.userdataWithOnesig));
    });
  }



}
