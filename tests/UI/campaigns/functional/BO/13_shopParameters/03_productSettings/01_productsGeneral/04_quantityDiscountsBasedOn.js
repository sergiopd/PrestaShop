require('module-alias/register');
const {expect} = require('chai');

// Import utils
const helper = require('@utils/helpers');
const loginCommon = require('@commonTests/loginBO');

// Import pages
const LoginPage = require('@pages/BO/login');
const DashboardPage = require('@pages/BO/dashboard');
const ProductSettingsPage = require('@pages/BO/shopParameters/productSettings');
const ProductsPage = require('@pages/BO/catalog/products');
const AddProductPage = require('@pages/BO/catalog/products/add');
const FOProductPage = require('@pages/FO/product');
const CartPage = require('@pages/FO/cart');

// Import data
const ProductFaker = require('@data/faker/product');

// Import test context
const testContext = require('@utils/testContext');

const baseContext = 'functional_BO_shopParameters_productSettings_quantityDiscountsBasedOn';


let browserContext;
let page;
const productWithCombinations = new ProductFaker(
  {
    type: 'Standard product',
    price: 20,
    combinations: {
      Color: ['White', 'Black'],
      Size: ['S'],
    },
    quantity: 10,
    specificPrice: {
      combinations: 'Size - S, Color - White',
      discount: 50,
      startingAt: 2,
      reductionType: '%',
    },
  },
);

const firstAttributeToChoose = {color: 'White'};
const secondAttributeToChoose = {color: 'Black'};

const firstCartTotalTTC = 30;
const secondCartTotalTTC = 40;
let numberOfProducts = 0;

// Init objects needed
const init = async function () {
  return {
    loginPage: new LoginPage(page),
    dashboardPage: new DashboardPage(page),
    productSettingsPage: new ProductSettingsPage(page),
    productsPage: new ProductsPage(page),
    addProductPage: new AddProductPage(page),
    foProductPage: new FOProductPage(page),
    cartPage: new CartPage(page),
  };
};

/*
Choose quantity discounts based on 'Products'
Create product with combinations and add a specific price(discount 50% for the first combination)
Add the combinations to the cart and check the price TTC
Choose quantity discounts based on 'Combinations'
Check the cart price TTC
 */
describe('Choose quantity discount based on', async () => {
  // before and after functions
  before(async function () {
    browserContext = await helper.createBrowserContext(this.browser);
    page = await helper.newTab(browserContext);

    this.pageObjects = await init();
  });

  after(async () => {
    await helper.closeBrowserContext(browserContext);
  });

  // Login into BO and go to product settings page
  loginCommon.loginBO();

  it('should go to \'Shop parameters > Product Settings\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToProductSettingsPage1', baseContext);

    await this.pageObjects.dashboardPage.goToSubMenu(
      this.pageObjects.dashboardPage.shopParametersParentLink,
      this.pageObjects.dashboardPage.productSettingsLink,
    );

    await this.pageObjects.productSettingsPage.closeSfToolBar();

    const pageTitle = await this.pageObjects.productSettingsPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.productSettingsPage.pageTitle);
  });

  it('should choose quantity discounts based on \'Products\'', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'chooseQuantityDiscountsBasedOnProducts', baseContext);

    const result = await this.pageObjects.productSettingsPage.chooseQuantityDiscountsBasedOn('Products');
    await expect(result).to.contains(this.pageObjects.productSettingsPage.successfulUpdateMessage);
  });

  it('should go to \'Catalog > Products\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPage', baseContext);

    await this.pageObjects.productSettingsPage.goToSubMenu(
      this.pageObjects.productSettingsPage.catalogParentLink,
      this.pageObjects.productSettingsPage.productsLink,
    );

    const pageTitle = await this.pageObjects.productsPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.productsPage.pageTitle);
  });

  it('should reset all filters', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'resetFilterProducts', baseContext);

    numberOfProducts = await this.pageObjects.productsPage.resetAndGetNumberOfLines();
    await expect(numberOfProducts).to.be.above(0);
  });

  it('should create product with combinations and add a specific price', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'createProduct', baseContext);

    await this.pageObjects.productsPage.goToAddProductPage();
    await this.pageObjects.addProductPage.createEditBasicProduct(productWithCombinations);

    const createProductMessage = await this.pageObjects.addProductPage.setCombinationsInProduct(
      productWithCombinations,
    );

    await this.pageObjects.addProductPage.addSpecificPrices(productWithCombinations.specificPrice);
    await expect(createProductMessage).to.equal(this.pageObjects.addProductPage.settingUpdatedMessage);
  });

  it('should preview product and check price TTC in FO', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'previewProductAndCheckPriceTTC', baseContext);

    page = await this.pageObjects.addProductPage.previewProduct();
    this.pageObjects = await init();

    await this.pageObjects.foProductPage.addProductToTheCart(1, firstAttributeToChoose, false);
    await this.pageObjects.foProductPage.addProductToTheCart(1, secondAttributeToChoose, true);

    const priceTTC = await this.pageObjects.cartPage.getTTCPrice();
    await expect(priceTTC).to.equal(firstCartTotalTTC);

    page = await this.pageObjects.cartPage.closePage(browserContext, 0);
    this.pageObjects = await init();
  });

  it('should go to \'Shop parameters > Product Settings\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToProductSettingsPage2', baseContext);

    await this.pageObjects.addProductPage.goToSubMenu(
      this.pageObjects.addProductPage.shopParametersParentLink,
      this.pageObjects.addProductPage.productSettingsLink,
    );

    const pageTitle = await this.pageObjects.productSettingsPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.productSettingsPage.pageTitle);
  });

  it('should choose quantity discounts based on \'Combinations\'', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'chooseQuantityDiscountsBasedOnCombinations', baseContext);

    const result = await this.pageObjects.productSettingsPage.chooseQuantityDiscountsBasedOn('Combinations');
    await expect(result).to.contains(this.pageObjects.productSettingsPage.successfulUpdateMessage);
  });

  it('should view my shop and check price TTC in FO', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'ViewMyShopAndCheckPriceTTC', baseContext);

    page = await this.pageObjects.productSettingsPage.viewMyShop();
    this.pageObjects = await init();

    await this.pageObjects.foProductPage.goToCartPage();
    const priceTTC = await this.pageObjects.cartPage.getTTCPrice();
    await expect(priceTTC).to.equal(secondCartTotalTTC);

    page = await this.pageObjects.cartPage.closePage(browserContext, 0);
    this.pageObjects = await init();
  });

  it('should go to \'Catalog > Products\' page', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'goToProductsPageToDeleteProduct', baseContext);

    await this.pageObjects.productSettingsPage.goToSubMenu(
      this.pageObjects.productSettingsPage.catalogParentLink,
      this.pageObjects.productSettingsPage.productsLink,
    );

    const pageTitle = await this.pageObjects.productsPage.getPageTitle();
    await expect(pageTitle).to.contains(this.pageObjects.productsPage.pageTitle);
  });

  it('should delete product from DropDown Menu', async function () {
    await testContext.addContextItem(this, 'testIdentifier', 'deleteProduct', baseContext);

    const deleteTextResult = await this.pageObjects.productsPage.deleteProduct(productWithCombinations);
    await expect(deleteTextResult).to.equal(this.pageObjects.productsPage.productDeletedSuccessfulMessage);

    const numberOfProductsAfterDelete = await this.pageObjects.productsPage.resetAndGetNumberOfLines();
    await expect(numberOfProductsAfterDelete).to.equal(numberOfProducts);
  });
});
