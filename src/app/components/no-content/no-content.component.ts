import { Component } from '@angular/core';

@Component({
  selector: 'no-content',
  template: `
    <div fxLayout="column" fxLayoutAlign="center center" fxFill>
      <h1 style="color: #fff">404: page missing</h1>
    </div>
  `
})
export class NoContentComponent {

}
