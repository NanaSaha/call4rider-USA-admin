import { Component, NgZone, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { UserService } from "../auth/user.service";
import { DriverRegService } from "../driver-registration/driver-reg.service";
import { FcmMessagingService } from "../services/fcm-messaging.service";
import { LoadingController, AlertController } from "@ionic/angular";

@Component({
  selector: "app-job",
  templateUrl: "./job.page.html",
  styleUrls: ["./job.page.scss"],
})
export class JobPage implements OnInit {
  drivers: any;
  data: any;
  job: any;
  user: any;
  driver: any;
  isAssigned: boolean = false;
  rider: string;
  SelectedDriver: any;
  driver_phone;

  constructor(
    private driverSvr: DriverRegService,
    private zone: NgZone,
    private activatedRoute: ActivatedRoute,
    private userService: UserService,
    private fcmSer: FcmMessagingService,
    private loadingCtrl: LoadingController
  ) { }

  refresh() {
    this.loadingCtrl
      .create({
        message: "Refreshing ...",
      })
      .then((loadingEl) => {
        loadingEl.present();
        this.driverSvr.getDriversOnline().subscribe(
          (res) => {
            this.drivers = res.map((item) => (item = { ...item, open: false }));
            // console.log("ALL DRIVER DETAILS " + JSON.stringify(this.drivers));
            // console.log(
            //   "SHOWIN ALL DRIVERS ONLINE!! " + JSON.stringify(this.drivers)
            // );

            if (this.drivers.length > 0) {
              this.zone.run(() => {
                this.drivers[0].open = false;
              });
            }
            loadingEl.dismiss();
          },
          (err) => {
            console.log(err);
            loadingEl.dismiss();
          }
        );
      });
  }

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params && params.job) {
        this.job = JSON.parse(params.job);
        this.rider = this.job.user.firstName + " " + this.job.user.lastName;
        // console.log("this is the Job!! "+ JSON.stringify(this.job));
        console.log("ALL JOB DETAILS " + JSON.stringify(this.job));
        console.log("this is the Job!! " + this.job.id);
        console.log("RIDER PHONE -->>", this.job.user.phone)
      }
    });
    this.driverSvr.getDriversOnline().subscribe(
      (res) => {
        this.drivers = res.map((item) => (item = { ...item, open: false }));
        // console.log("ALL DRIVER DETAILS " + JSON.stringify(this.drivers));
        // console.log(
        //   "SHOWIN ALL DRIVERS ONLINE!! " + JSON.stringify(this.drivers)
        // );

        // let driver_uid = this.drivers[0].uid

        // console.log(
        //   "driver_uid " + driver_uid
        // );


        // this.driverSvr.getDriverDocIdUsingUserId(driver_uid).subscribe((user) => {
        //   console.log("GETTING DRIVER DATA HERE" + JSON.stringify(user))

        //   this.driver_phone = user[0].phone
        //   console.log("driver_phone" + this.driver_phone)
        // })

        if (this.drivers.length > 0) {
          this.zone.run(() => {
            this.drivers[0].open = false;
          });
        }
      },
      (err) => {
        console.log(err);
      }
    );
    this.getUserData();
  }
  ionViewWillEnter() { }

  private getUserData() {
    this.userService.getUserByUserId().subscribe((userdatas) => {
      console.log(userdatas);
      if (userdatas.length > 0) {
        let userdata = userdatas[0];
        this.user = userdata;

        //console.log(userdata);
      }
    });
  }
  toggleSelection(index) {
    this.SelectedDriver = this.drivers[index];
    // console.log(
    //   "this is the SELECTED Driver UID!! " + JSON.stringify(this.SelectedDriver)
    // );
    console.log("this.SelectedDriver.id ", this.SelectedDriver.id);
    console.log("this.SelectedDriver Uid ", this.SelectedDriver.uid);

    this.driverSvr.getDriverDocIdUsingUserId(this.SelectedDriver.uid).subscribe((user) => {
      console.log("GETTING DRIVER DATA HERE" + JSON.stringify(user))

      this.driver_phone = user[0].phone
      console.log("driver_phone" + this.driver_phone)
    })
    this.drivers[index].open = !this.drivers[index].open;
    if (this.drivers[index].open) {
      this.drivers
        .filter((item, itemIndex) => itemIndex != index)
        .map((item) => (item.open = false));
    }
  }

  assignedJobtoMe() {
    let driverJob: any = {};
    driverJob.startAddress = this.job.startAddress;
    driverJob.endAddress = this.job.endAddress;
    driverJob.tripDate = this.job.tripDate;
    driverJob.time = this.job.time;
    driverJob.active = true;
    driverJob.status = "in progress";
    driverJob.assignedDate = new Date();
    driverJob.driverId = this.SelectedDriver.uid;
    driverJob.jobDocId = this.job.id;
    driverJob.firstName = this.job.user.firstName;
    driverJob.lastName = this.job.user.lastName;
    driverJob.phoneNumber = this.job.user.phone;
    driverJob.riderID = this.job.user.userId;
    driverJob.duration = this.job.distance_duration;
    driverJob.fare = this.job.fare;
    console.log("DRIVER DETAILS ", driverJob);
    console.log("this.SelectedDriver.id ", this.SelectedDriver.id);
    console.log("this.UI.id ", this.SelectedDriver.uid);

    this.driverSvr.assignJobToDriver(this.SelectedDriver.id, driverJob).then(
      (res) => {
        this.isAssigned = true;
        console.log(res);
        this.userService.send_sms(this.driver_phone, "A new job has been sent to you. Kindly check your job dashboard")
      },
      (err) => {
        this.isAssigned = false;
        console.log(err);
      }
    );

    //Save DRIVER TO USER PROFILE
    this.driverSvr
      .assignDriverToUser(
        this.job.user.userId,
        this.SelectedDriver.uid,
        driverJob
      )
      .then(
        (res) => {
          console.log("DRIVER ASSIGNED TO USER");
          this.userService.send_sms(this.job.user.phone, "A driver has been assigned to you. Track your driver ")
          console.log(res);
        },
        (err) => {
          this.isAssigned = false;
          console.log(err);
        }
      );

    //Make Driver Accept false
    this.driverSvr.rideAccepted(this.SelectedDriver.id, false).then(
      (res) => {
        console.log("RESPONSE FROM DRIVERS" + res);
      },
      (err) => {
        console.log("ERROR DRIVER", err);
      }
    );

    // this.driverSvr.getDriverById(this.user.userId).subscribe((drivers)=>{
    //   let driverJob:any = {};
    //   driverJob.startAddress = this.job.startAddress;
    //   driverJob.endAddress = this.job.endAddress;
    //   driverJob.tripDate = this.job.tripDate;
    //   driverJob.time = this.job.time;
    //   driverJob.active = true;
    //   driverJob.status = "in progress";
    //   driverJob.assignedDate = new Date();
    //   driverJob.driverId = drivers[0].uid;
    //   driverJob.jobDocId = this.job.id;

    //   console.log(driverJob);

    // },
    // (err)=>{
    //   console.log(err);
    // });

    //console.log(this.job);
  }
}
