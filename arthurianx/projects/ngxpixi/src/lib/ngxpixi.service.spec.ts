import { TestBed } from '@angular/core/testing';

import { NgxpixiService } from './ngxpixi.service';

describe('NgxpixiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: NgxpixiService = TestBed.get(NgxpixiService);
    expect(service).toBeTruthy();
  });
});
