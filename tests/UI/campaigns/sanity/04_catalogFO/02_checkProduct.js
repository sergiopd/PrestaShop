require('module-alias/register');
// Using chai
const {expect} = require('chai');
const helper = require('@utils/helpers');
const testContext = require('@utils/testContext');

const baseContext = 'sanity_catalogFO_checkProduct';
// Importing pages
const HomePage = require('@pages/FO/home');
const ProductPage = require('@pages/FO/product');
const ProductData = require('@data/FO/product');


let browserContext;
let page;

// creating pages objects in a function
const init = async function () {
  return {
    homePage: new HomePage(page),
    productPage: new ProductPage(page),
  };
};

/*
  Open the FO home page
  Check the first product page
 */
describe('Check the Product page', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);

    this.pageObjects = await init();
  });
  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  // Steps
  it('should open the shop page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToShopFO', baseContext);
    await this.pageObjects.homePage.goTo(global.FO.URL);
    const result = await this.pageObjects.homePage.isHomePage();
    await expect(result).to.be.true;
  });

  it('should go to the first product page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToProductPage', baseContext);
    await this.pageObjects.homePage.goToProductPage('1');
    const pageTitle = await this.pageObjects.productPage.getPageTitle();
    await expect(pageTitle.toUpperCase()).to.contains(ProductData.firstProductData.name);
  });

  it('should check the product page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'checkProductPage', baseContext);
    const result = await this.pageObjects.productPage.getProductInformation(ProductData.firstProductData);
    await Promise.all([
      expect(result.name.toLowerCase()).to.equal(ProductData.firstProductData.name.toLocaleLowerCase()),
      expect(result.price).to.equal(ProductData.firstProductData.price),
      expect(result.description).to.contains(ProductData.firstProductData.description),
    ]);
  });
});
