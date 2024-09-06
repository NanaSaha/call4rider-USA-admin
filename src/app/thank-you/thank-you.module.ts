import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ThankYouPageRoutingModule } from './thank-you-routing.module';

import { ThankYouPage } from './thank-you.page';

import { RxReactiveFormsModule } from "@rxweb/reactive-form-validators"
import { ReactiveFormsModule } from "@angular/forms";
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThankYouPageRoutingModule,
    RxReactiveFormsModule,
    ReactiveFormsModule
  ],
  declarations: [ThankYouPage]
})
export class ThankYouPageModule { }
