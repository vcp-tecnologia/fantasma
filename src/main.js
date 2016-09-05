// TODO fix jquery detection and injection

import {
  log,
  debug,
  info,
  error,
} from './lib/logging';

const BASE_URL = "https://www.imstores.com/Ingrammicromx";
const INGRAM_LOGIN_URL = `${BASE_URL}/login/login.aspx`;
const LOGGED_IN_URL = `${BASE_URL}/default.aspx`;
const LOGOUT_URL = `${BASE_URL}/login/logoff.aspx`;
const COMPUTADORAS = `${BASE_URL}/ProductSearch.aspx?MatrixKey=000001`;

const USERNAME = "CN44";
const PASSWORD = "VCPtec13";

const webPage = require('webpage');
const page = webPage.create();
page.settings.userAgent = 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:27.0) Gecko/20100101 Firefox/27.0';
page.settings.resourceTimeout = 20000; // 20 seconds
page.onResourceTimeout = (e) => {
  error(e.errorString + " Code: " + e.errorCode + ", Url: " + e.url);
  phantom.exit(1);
};
page.onError = (msg, trace) => {
  let msgStack = [msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
    });
  }
  error(msgStack.join('\n'));
};
phantom.onError = (msg, trace) => {
  let msgStack = [msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
    });
  }
  error(msgStack.join('\n'));
  phantom.exit(1);
};


function exitOnFailedStatus(status, page) {
  if (status === "success") {
    info("Successfully opened page: " + page.url);
    return;
  }
  else{
    error("Failed to load page: " + page.url);
    logoff(page, 1);
  }
}

function logoff(page, exitCode) {
  info("Attempting to log off.");
  page.open(LOGOUT_URL, function(status) {
    if (status === "success") {
      info("Successfully logged off. Url is: " + page.url);
      info("Exiting with code: " + exitCode);
      phantom.exit(exitCode);
    }
    else {
      error("Failed to log off. Url is: " + page.url);
      info("Exiting with code: " + 1);
      phantom.exit(1);
    }
  });
}

function handleLoginPage(status) {
  exitOnFailedStatus(status, page);

  // Fill out login form with credentials and click submit
  info("Attempting to log in.");
  page.evaluate(function() {
      document.querySelector('input[name="UserName"]').setAttribute('value', "CN44");
      document.querySelector('input[name="txtPassword"]').setAttribute('value', "VCPtec13");
      document.querySelector('[name="LoginButton"]').click();
  });

  // Wait and check for successfull login
  window.setTimeout(function() {
    if(page.url === INGRAM_LOGIN_URL) {
      error("Failed to log in.");
      info("Exiting with code: " + 1);
      phantom.exit(1);
    }
    else {
      info("Successfully logged in. Current url is: " + page.url);
      page.open(COMPUTADORAS, handleProductCategoryPage);
    }
  }, 10000);
}

function scrapeProductPaginatedPage() {
  // if (!window.$){
  //   return {
  //     "status": "error"
  //     "message": "JQuery not available."
  //   }
  // }
  var BASE_URL = "https://www.imstores.com/Ingrammicromx";

  var rows = $('.Row');
  var numrows = rows.length;

  var inventoryRegex = /^(\d)+ +\[(\d)+\]$/;
  var partNumRegex = /^Part#: +(.*)$/;
  var skuRegex = /^SKU: +(.*)$/;
  var priceRegex = /^\$ +([0-9\.,]+)$/

  var path, inventoryStore, inventoryTotal, sku, partnum, price;

  var i, match;
  var products = [];

  for(i = 0; i < numrows; ++i) {
    path = BASE_URL + "/" + $('.Row')[i].children[1].children[0].children[0].children[0].children[0].children[0].children[1].getAttribute('href');

    match = inventoryRegex.exec($('.Row')[i].children[2].innerText.trim());
    inventoryStore = match ? match[1] : "NULL";
    inventoryTotal = match ? match[2] : "NULL";

    match = partNumRegex.exec($('.Row')[i].children[0].children[0].children[0].children[0].children[1].innerText.trim());
    partnum = match ? match[1] : "NULL";

    match = skuRegex.exec($('.Row')[i].children[0].children[0].children[0].children[0].children[2].innerText.trim());
    sku = match ? match[1] : "NULL";

    match = priceRegex.exec($('.Row')[i].children[3].innerText.trim());
    price = match ? match[1] : "NULL";

    products.push({
      path: path,
      inventoryStore: inventoryStore,
      inventoryTotal: inventoryTotal,
      partnum: partnum,
      sku: sku,
      price: price
    });
  }

  return {
    "status": "success",
    "products": products
  }
}

function scrapeProductCategoryPage() {
  const retVal = page.evaluate(scrapeProductPaginatedPage);

  if (retVal.status === "error") {
    error(retVal.message);
    logoff(page, 1);
  }

  let products = retVal.products;
  let i, product;

  debug(`Retrieved data for ${products.length} products.`);

  for (i = 0; i < products.length; ++i) {
    product = products[i];
    log(JSON.stringify(product), "DATA");
  }

  logoff(page, 0);
}

function handleProductCategoryPage(status) {
  exitOnFailedStatus(status, page);

  // Change the number of results per page to minimize pagination
  page.evaluate(function() {
    $('[name="ctl00$ContentPlaceHolder1$ddlResultsPerPage"]').val('50');
    $('[name="ctl00$ContentPlaceHolder1$ddlResultsPerPage"]').trigger('change');
  });

  // Wait wait for successfull refresh and proceed to scrape the whole category
  window.setTimeout(scrapeProductCategoryPage, 10000);
}

page.open(INGRAM_LOGIN_URL, handleLoginPage);
