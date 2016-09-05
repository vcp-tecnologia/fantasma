// TODO remove all jquery dependencies inside evaluate code
// modularize code, remove page global, pass it around functions


import {
  log,
  debug,
  info,
  error,
} from './lib/logging';



/* CONSTANTS */

const BASE_URL = 'https://www.imstores.com/Ingrammicromx';
const INGRAM_LOGIN_URL = `${BASE_URL}/login/login.aspx`;
const LOGGED_IN_URL = `${BASE_URL}/default.aspx`;
const LOGOUT_URL = `${BASE_URL}/login/logoff.aspx`;
const COMPUTADORAS = `${BASE_URL}/ProductSearch.aspx?MatrixKey=000001`;

const USERNAME = 'CN44';
const PASSWORD = 'VCPtec13';

const ERROR_EXIT_CODE = 1;
const SUCCESS_EXIT_CODE = 0;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';

const LOGIN_FORM_USERNAME_SELECTOR = 'input[name="UserName"]';
const LOGIN_FORM_PASSWORD_SELECTOR = 'input[name="txtPassword"]';
const LOGIN_FORM_SUBMIT_SELECTOR = '[name="LoginButton"]';
const RESULTS_PER_PAGE_SELECTOR = '[name="ctl00$ContentPlaceHolder1$ddlResultsPerPage"]';
const NEXT_PAGE_SELECTOR = '#ctl00_ContentPlaceHolder1_btnNext';
const CURRENT_PAGE_SELECTOR = '#ctl00_ContentPlaceHolder1_ddlPageNumber';

const NULL_VALUE = 'NULL';

const RESOURCE_TIMEOUT = 20000; /* 20 seconds */
const LOGIN_WAIT_TIME = 10000; /* 10 seconds */
const CHANGE_RESULTS_PER_PAGE_WAIT_TIME = 10000; /* 10 seconds */
const PAGINTATION_WAIT_TIME = 10000; /* 10 seconds */
const SCRAPING_TOTAL_TIMEOUT = 180000;
const RESULTS_PER_PAGE = 50;

/* END CONSTANTS */






/* PHANTOMJS CONFIGURATION */

const webPage = require('webpage');
const page = webPage.create();

page.settings.userAgent = USER_AGENT;
page.settings.resourceTimeout = RESOURCE_TIMEOUT;

page.onResourceTimeout = (e) => {
  error(`${e.errorString} Code: ${e.errorCode}, Url: ${e.url}`);
  exit(ERROR_EXIT_CODE);
};

page.onError = (msg, trace) => {
  let msgStack = [msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      let fnct = t.function ? ` (in function "${t.function}")` : '';
      let msg = ` -> ${t.file}: ${t.line}${fnct}`;
      msgStack.push(msg);
    });
  }
  error(msgStack.join('\n'));
  exit(ERROR_EXIT_CODE);
};

phantom.onError = (msg, trace) => {
  let msgStack = [msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      let fnct = t.function ? ` (in function "${t.function}")` : '';
      let msg = ` -> ${t.file || t.sourceURL}: ${t.line}${fnct}`;
      msgStack.push(msg);
    });
  }
  error(msgStack.join('\n'));
  exit(ERROR_EXIT_CODE);
};

/* END PHANTOMJS CONFIGURATION */






/* UTILITY FUNCTIONS */

function exitOnFailedStatus(status, page) {
  if (status === 'success') {
    info(`Successfully opened page: ${page.url}`);
    return;
  }
  else{
    error(`Failed to load page: ${page.url}`);
    logoff(page, ERROR_EXIT_CODE);
  }
}

function logoff(page, exitCode) {
  info('Attempting to log off.');
  page.open(LOGOUT_URL, function(status) {
    if (status === 'success') {
      info(`Successfully logged off. Url is: ${page.url}`);
      exit(exitCode);
    }
    else {
      error(`Failed to log off. Url is: ${page.url}`);
      exit(ERROR_EXIT_CODE);
    }
  });
}

function exit(exitCode) {
  info(`Exiting with code: ${exitCode}`);
  phantom.exit(exitCode);
}

/* END UTILITY FUNCTIONS */






/* BROWSER EVALUATED FUNCTIONS */

function fillLoginForm(options) {
  document.querySelector(options.usernameSelector).setAttribute('value', options.username);
  document.querySelector(options.passwordSelector).setAttribute('value', options.password);
  document.querySelector(options.submitSelector).click();
}

function changeResultsPerPage(options) {
  document.querySelector(options.resultsPerPageSelector).value = options.resultsPerPage;
  $(options.resultsPerPageSelector).trigger('change');  
}

function scrapeProductPaginatedPage(options) {
  var rows = document.querySelectorAll('.Row');
  var numrows = rows.length;

  var inventoryRegex = /^(\d)+ +\[(\d)+\]$/;
  var partNumRegex = /^Part#: +(.*)$/;
  var skuRegex = /^SKU: +(.*)$/;
  var priceRegex = /^\$ +([0-9\.,]+)( +\$ +([0-9\.,]+))?$/;

  var path, inventoryStore, inventoryTotal, sku, partnum, price, discountedPrice;

  var i, match;
  var products = [];

  for(i = 0; i < numrows; ++i) {
    var row = rows[i];
    path = options.baseUrl + '/' + row.children[1].children[0].children[0].children[0].children[0].children[0].children[1].getAttribute('href');

    match = inventoryRegex.exec(row.children[2].innerText.trim());
    inventoryStore = match ? match[1] : options.nullValue;
    inventoryTotal = match ? match[2] : options.nullValue;

    match = partNumRegex.exec(row.children[0].children[0].children[0].children[0].children[1].innerText.trim());
    partnum = match ? match[1] : options.nullValue;

    match = skuRegex.exec(row.children[0].children[0].children[0].children[0].children[2].innerText.trim());
    sku = match ? match[1] : options.nullValue;

    match = priceRegex.exec(row.children[3].innerText.trim().replace('\n', ' '));
    price = match ? (match[1] || options.nullValue) : options.nullValue;
    discountedPrice = match ? (match[3] || options.nullValue) : options.nullValue;

    products.push({
      path: path,
      inventoryStore: inventoryStore,
      inventoryTotal: inventoryTotal,
      partnum: partnum,
      sku: sku,
      price: price,
      discountedPrice: discountedPrice
    });
  }

  return {
    'status': 'success',
    'products': products
  };
}

function advanceResultsPage(options){
  if(options.noop) {
    return;
  }
  var nextPage = document.querySelector(options.nextPageSelector);
  if (nextPage) {
    nextPage.click();
  }
}

function getCurrentPage(options){
  var currentPage = document.querySelector(options.currentPageSelector).value;
  return parseInt(currentPage);
}

/* END BROWSER EVALUATED FUNCTIONS */






/* APPLICATION LOGIC FUNCTIONS */

function paginateAndScrapeProductCategoryPage() { 
  let pagenum;

  const intervalId = window.setInterval(function() {
    pagenum = page.evaluate(getCurrentPage, {
      currentPageSelector: CURRENT_PAGE_SELECTOR
    });

    page.evaluate(advanceResultsPage, {
      nooop: pagenum === 1,
      nextPageSelector: NEXT_PAGE_SELECTOR
    });

    const retVal = page.evaluate(scrapeProductPaginatedPage, {
      baseUrl: BASE_URL,
      nullValue: NULL_VALUE
    });
    
    if (retVal.status === 'error') {
      error(retVal.message);
      logoff(page, ERROR_EXIT_CODE);
    }

    let products = retVal.products;

    debug(`Retrieved data for ${products.length} products.`);

    for (let i = 0; i < products.length; ++i) {
      let product = products[i];
      log(JSON.stringify(product), 'DATA');
    }
  }, PAGINTATION_WAIT_TIME);

  window.setTimeout(function() {
    clearInterval(intervalId);
    logoff(page, SUCCESS_EXIT_CODE);
  }, SCRAPING_TOTAL_TIMEOUT);
}

function handleProductCategoryPage(status) {
  exitOnFailedStatus(status, page);

  /* Change the number of results per page to minimize pagination */
  page.evaluate(changeResultsPerPage, { 
    resultsPerPage: RESULTS_PER_PAGE,
    resultsPerPageSelector: RESULTS_PER_PAGE_SELECTOR
  });

  /* Wait for successfull refresh and proceed to scrape the whole paginated subcategory */
  window.setTimeout(paginateAndScrapeProductCategoryPage, CHANGE_RESULTS_PER_PAGE_WAIT_TIME);
}

function handleLoginPage(status) {
  exitOnFailedStatus(status, page);

  /* Fill out login form with credentials and click submit */
  info('Attempting to log in.');
  page.evaluate(fillLoginForm, {
    usernameSelector: LOGIN_FORM_USERNAME_SELECTOR,
    passwordSelector: LOGIN_FORM_PASSWORD_SELECTOR, 
    submitSelector: LOGIN_FORM_SUBMIT_SELECTOR, 
    username: USERNAME,
    password: PASSWORD
  });

  /* Wait and check for successfull login */
  window.setTimeout(function() {
    if(page.url === INGRAM_LOGIN_URL) {
      error('Failed to log in.');
      exit(ERROR_EXIT_CODE);
    }
    else {
      info(`Successfully logged in. Current url is: ${page.url}`);
      page.open(COMPUTADORAS, handleProductCategoryPage);
    }
  }, LOGIN_WAIT_TIME);
}

/* END APPLICATION LOGIC FUNCTIONS */






page.open(INGRAM_LOGIN_URL, handleLoginPage);
