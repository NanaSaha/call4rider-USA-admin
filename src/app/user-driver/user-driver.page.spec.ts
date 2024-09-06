import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UserDriverPage } from './user-driver.page';

describe('UserDriverPage', () => {
  let component: UserDriverPage;
  let fixture: ComponentFixture<UserDriverPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UserDriverPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDriverPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
