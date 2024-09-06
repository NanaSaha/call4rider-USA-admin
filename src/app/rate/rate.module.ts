import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { RatePageRoutingModule } from "./rate-routing.module";

import { RatePage } from "./rate.page";
import { IonicRatingModule } from "ionic4-rating";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RatePageRoutingModule,
    IonicRatingModule,
  ],
  declarations: [RatePage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class RatePageModule {}
