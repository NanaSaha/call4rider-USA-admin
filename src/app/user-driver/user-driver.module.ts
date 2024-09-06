import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserDriverPageRoutingModule } from './user-driver-routing.module';

import { UserDriverPage } from './user-driver.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserDriverPageRoutingModule
  ],
  declarations: [UserDriverPage]
})
export class UserDriverPageModule {}
