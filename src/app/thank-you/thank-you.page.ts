import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Injectable } from "@angular/core";
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { last, concatMap, first, map } from "rxjs/operators";
import {

  AlertController,
} from "@ionic/angular";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RxwebValidators } from '@rxweb/reactive-form-validators';


@Component({
  selector: 'app-thank-you',
  templateUrl: './thank-you.page.html',
  styleUrls: ['./thank-you.page.scss'],
})
export class ThankYouPage implements OnInit {

  // priceForm: FormGroup;
  public priceForm: any;
  data: any;
  riderName: string;
  car_type;
  price;
  basic;
  basic_doc_id

  constructor(private activatedRoute: ActivatedRoute, private storage: AngularFireStorage,
    private db: AngularFirestore, public alertCtrl: AlertController, private formBuilder: FormBuilder) {
    this.priceForm = this.formBuilder.group({
      car_type: ['', Validators.required],
      price: ['', Validators.required,],




    });
  }

  ngOnInit() {
    this
      .retrieve_prices()
      .subscribe((basic) => {
        console.log("CHECK BASIC REQUIR:::", basic)
        this.basic = basic
        let data = basic[0];

        console.log("LENGHT:::", this.basic.length)

        if (basic.length > 0) {
          let data = basic[0];
          this.basic_doc_id = data.id


        }
      })

  }

  NewPrice() {

    let formData: any = this.priceForm.value as {};

    this.car_type = formData.car_type;
    this.price = formData.price;
    console.log(this.car_type, this.price)

    if (this.car_type != null &&
      this.price != null) {

      this.save_price(this.car_type, this.price)
      this.priceForm.reset()
    }
    else {
      alert("Both entries should be made..")
    }

  }



  UpdatePrice(data) {
    console.log(data)
    let doc_id = data.id
    console.log("PRICE DOC ID::", doc_id)
    console.log("PRICE CAR TYPE::", data.car_type)

    this.alertCtrl
      .create({
        message: "Update Price",
        inputs: [
          {
            value: data.price,
          },
        ],
        buttons: [
          {
            text: "Cancel",
          },
          {
            text: "Accept",
            handler: (data) => {
              console.log(data[0]);
              this.update_price(doc_id, data[0])
            },
          },
        ],
      })
      .then((alertEl) => alertEl.present());
  }


  update_price(id, price) {
    console.log("id::" + id, "price " + price);
    return new Promise<any>((resolve, reject) => {
      this.db
        .collection("prices")
        .doc(id)
        .update({ price: price })
        .then(
          (res) => {
            console.log("RESPONSE FROM STATUS UDATE::" + resolve(res));
            resolve(res);
          },

          (err) => {
            console.log("ERROR HAPPEN");
            reject(err);
          }
        );
    });

  }


  save_price(car_type, price) {
    console.log(car_type)

    return new Promise<any>((resolve, reject) => {
      this.db
        .collection("prices")
        .add({ car_type: car_type, price: price })
        .then(
          (res) => resolve(res),
          (err) => reject(err)
        );
    });

  }



  retrieve_prices(): Observable<any> {


    return this.db
      .collection("prices")
      .snapshotChanges()
      .pipe(
        map((snaps) =>
          snaps.map((snap) => {
            let data: any = snap.payload.doc.data() as {};
            const id = snap.payload.doc.id;
            data.id = id;
            return {
              id: id,
              ...data,
            };
          })
        ),
        //first()
      );
  }


}
