import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TriphistoryPageRoutingModule } from './triphistory-routing.module';

import { TriphistoryPage } from './triphistory.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TriphistoryPageRoutingModule
  ],
  declarations: [TriphistoryPage]
})
export class TriphistoryPageModule {}
