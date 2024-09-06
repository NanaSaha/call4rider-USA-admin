import {
  Component,
  ElementRef,
  NgZone,
  OnInit,
  Renderer2,
  ViewChild,
} from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import {
  ActionSheetController,
  LoadingController,
  Platform,
} from "@ionic/angular";
import { AuthService } from "../auth/auth.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";
import { RideRequestsService } from "../ride-requests/ride-requests.service";
import { FcmMessagingService } from "../services/fcm-messaging.service";

@Component({
  selector: "app-triphistory",
  templateUrl: "./triphistory.page.html",
  styleUrls: ["./triphistory.page.scss"],
})
export class TriphistoryPage implements OnInit {
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
  automaticClose: boolean = true;
  isLoading: boolean;
  driver: any;
  driverJobs: any[];
  public items: any;
  name;

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
    private authService: AuthService,
    private driverSvr: DriverRegService
  ) {
    this.loading = this.loadingCtrl.create();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsDisplay = new google.maps.DirectionsRenderer();
  }

  ngOnInit() {
    this.authService.userId.subscribe((userId) => {
      if (!userId) {
        throw new Error("User not found!");
      }
      this.userId = userId;

      this.driverSvr.getUsers().subscribe((users) => {
        console.log("USERS ALL :::", users);

        users.forEach((snap) => {
          console.log("SNAAAPP USERS:::" + snap.userId);
          if (snap.userId) {
            this.driverSvr
              .getTripHistory(snap.userId)
              .subscribe((driverJobs) => {
                console.log("JOBS FOR RIDER:::", driverJobs);
                console.log("DRIVER JOBS:::", driverJobs.length);

                if (driverJobs.length > 0) {
                  this.items = [];
                  driverJobs.forEach(
                    (snap) => {
                      this.driverSvr
                        .getDriverById(snap.driver_id)
                        .subscribe((drivers) => {
                          this.zone.run(() => {
                            console.log(
                              "RETIRVIGN DRIVER DETAILS WITH UID " +
                              JSON.stringify(drivers)
                            );
                            console.log("DRIVEs:::", drivers.length);
                            let driver_details = drivers[0];

                            if (drivers.length > 0) {
                              this.name = driver_details.driverName;
                              console.log("DRIVER NAME " + this.name);
                            }
                          });

                          if (drivers.length > 0) {
                            if (this.name) {
                              this.items.push({
                                driver_name: this.name,
                                rider_name: snap.firstName + snap.lastName,
                                startAddress: snap.startAddress,
                                endAddress: snap.endAddress,
                                fare: snap.fare,
                                status: snap.status,
                                time: snap.time,
                              });
                              this.items;
                              console.log("ITEM LISTSS::: ", this.items);
                              return false;
                            } else {
                              console.log("NAME IS UNDEFINED");
                            }
                          }
                        });

                      this.driverJobs = driverJobs.map(
                        (item) =>
                        (item = {
                          ...item,
                          open: false,
                          distance: "",
                          tripeTime: new Date(item.time),
                        })
                      );
                    },
                    (err) => console.log
                  );
                }
              });
          }
        });
      });
    });
  }

  async goBack() {
    this.router.navigateByUrl("/ride-requests");
  }
}
