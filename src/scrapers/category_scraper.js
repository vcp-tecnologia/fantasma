import {
  debug,
  error,
  info,
  log,
  exit,
  exitOnFailedStatus,
  logoff,
  login,
} from '../lib/utils';

import {
  BASE_URL,
  ERROR_EXIT_CODE,
  SUCCESS_EXIT_CODE,
  RESULTS_PER_PAGE_SELECTOR,
  NEXT_PAGE_SELECTOR,
  CURRENT_PAGE_SELECTOR,
  CHANGE_RESULTS_PER_PAGE_WAIT_TIME,
  PAGINATION_WAIT_TIME,
  RESULTS_PER_PAGE,
} from '../../config/settings';

import { configurePhantomJS } from '../lib/phantom_configuration';


/* BROWSER EVALUATED FUNCTIONS */


function changeResultsPerPage(options) {
  document.querySelector(options.resultsPerPageSelector).value = options.resultsPerPage;
  document.querySelector(options.resultsPerPageSelector).onchange();
}

function scrapeProductPaginatedPage(options) {
  var rows = document.querySelectorAll('.Row');
  var numrows = rows.length;

  var productUrl, i;
  var products = [];

  for(i = 0; i < numrows; ++i) {
    productUrl = options.baseUrl + '/' + rows[i].children[1].children[0].children[0].children[0].children[0].children[0].children[1].getAttribute('href');
    products.push(productUrl);
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

function paginateAndScrapeCategoryPage(phantom, page) { 
  let pageNumber = null;

  const paginationIntervalId = window.setInterval(function() {
    let newPageNumber = page.evaluate(getCurrentPage, { currentPageSelector: CURRENT_PAGE_SELECTOR });

    window.setTimeout(function() {
      log('Page number is: ' + newPageNumber, 'DEBUG');

      if (newPageNumber !== pageNumber) {
        pageNumber = newPageNumber;
        page.evaluate(advanceResultsPage, {
          nooop: pageNumber === 1,
          nextPageSelector: NEXT_PAGE_SELECTOR
        });

        const retVal = page.evaluate(scrapeProductPaginatedPage, { baseUrl: BASE_URL });
        
        if (retVal.status === 'error') {
          error(retVal.message);
          logoff(phantom, page, ERROR_EXIT_CODE);
        }

        debug(`Retrieved paginated data for ${retVal.products.length} products. Page ${pageNumber}`);

        for (let i = 0; i < retVal.products.length; ++i) {
          let productUrl = retVal.products[i];
          log(productUrl, 'DATA');
        }
      }
      else {
        clearInterval(paginationIntervalId);
        logoff(phantom, page, SUCCESS_EXIT_CODE);
      }      
    }, 2000);
  }, PAGINATION_WAIT_TIME);
}

function handleCategoryPage(phantom, page, categoryUrl) {
  page.open(categoryUrl, function (status){
    exitOnFailedStatus(phantom, page, status);

    /* Change the number of results per page to minimize pagination */
    page.evaluate(changeResultsPerPage, { 
      resultsPerPage: RESULTS_PER_PAGE,
      resultsPerPageSelector: RESULTS_PER_PAGE_SELECTOR
    });

    /* Wait for successfull refresh and proceed to scrape the whole paginated subcategory */
    window.setTimeout(paginateAndScrapeCategoryPage, CHANGE_RESULTS_PER_PAGE_WAIT_TIME, phantom, page);    
  });
}


/* END APPLICATION LOGIC FUNCTIONS */



function parseAndValidateCmdLineArgs(phantom) {
  const system = require('system');
  const args = system.args;

  if (args.length !== 3) {
    error('Usage: phantomjs category_scraper.js [category] [url]');
    exit(phantom, ERROR_EXIT_CODE);
  }
  
  return {
    categoryName: args[1],
    categoryUrl: args[2]
  }
}

function run(phantom) {
  const { categoryName, categoryUrl } = parseAndValidateCmdLineArgs(phantom);

  const page = require('webpage').create();
  configurePhantomJS(phantom, page);

  info(`Starting scraping of category: ${categoryName}, and url: ${categoryUrl}`);
  login(phantom, page, handleCategoryPage, categoryUrl);
}

run(phantom);
