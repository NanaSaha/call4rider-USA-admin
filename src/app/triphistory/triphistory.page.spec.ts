import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TriphistoryPage } from './triphistory.page';

describe('TriphistoryPage', () => {
  let component: TriphistoryPage;
  let fixture: ComponentFixture<TriphistoryPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriphistoryPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TriphistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
