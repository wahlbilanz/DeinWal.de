import { Ww4Page } from './app.po';

describe('ww4 App', () => {
  let page: Ww4Page;

  beforeEach(() => {
    page = new Ww4Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
