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
  SUCCESS_EXIT_CODE,
  ERROR_EXIT_CODE,
  SPECS_LOAD_WAIT_TIME,
  SPECS_TAB_SELECTOR
} from '../../config/settings';

import { configurePhantomJS } from '../lib/phantom_configuration';
import _ from 'lodash';

/* BROWSER EVALUATED FUNCTIONS */

function productData() {

  function specifications() {
    var output = {};
    if(document.getElementById('ctl00_ContentPlaceHolder1_grdDetInfo') &&
       document.getElementById('ctl00_ContentPlaceHolder1_grdDetInfo').children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_grdDetInfo').children[0].children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_grdDetInfo').children[0].children[0].children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_grdDetInfo').children[0].children[0].children[0].children[0] && 
       document.getElementById('ctl00_ContentPlaceHolder1_grdDetInfo').children[0].children[0].children[0].children[0].children[0]) {
      var rows = document.getElementById('ctl00_ContentPlaceHolder1_grdDetInfo').children[0].children[0].children[0].children[0].children[0].children;

      for (var i = 1; i < rows.length; ++i) {
        var row = rows[i];
        var property = row.children[1].innerText.trim().toLowerCase();
        var value = row.children[2].innerText.trim();
        output[property] = value;
      }  

    }
    return output;
  }

  function dimensions(){
    var output = {};

    if(document.getElementById('ctl00_ContentPlaceHolder1_PageView5') && 
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0] && 
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0] && 
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0] && 
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0].children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0].children[0].children[1] &&
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0].children[0].children[1].children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0].children[0].children[1].children[0].children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children) {
      var dimensions = document.getElementById('ctl00_ContentPlaceHolder1_PageView5').children[0].children[0].children[0].children[0].children[0].children[1].children[0].children[0].children[0].children

      
      for(var i = 0; i < dimensions.length; ++i) {
        var dim = dimensions[i];
        var property = dim.children[0].innerText.trim().replace(":", "").toLowerCase();
        var value = dim.children[1].innerText.trim().toLowerCase();
        output[property] = value;
      }        
    }

    return output;
  }


  function inventory() {
    var sum = 0;
    
    if(document.getElementById('ctl00_ContentPlaceHolder1_grdShipFrom_dom') &&
       document.getElementById('ctl00_ContentPlaceHolder1_grdShipFrom_dom').children[0] &&
       document.getElementById('ctl00_ContentPlaceHolder1_grdShipFrom_dom').children[0].children[0]) {
      var rows = document.getElementById('ctl00_ContentPlaceHolder1_grdShipFrom_dom').children[0].children[0].children;
      for (var i = 1; i < rows.length; ++i) {
        var row = rows[i];
        sum += parseInt(row.children[2].innerText.trim().replace("\n", ""));
      }      
    }
    return sum;
  }

  if(document && 
     document.getElementById('photo-zone') &&
     document.getElementById('photo-zone').children[0] &&
     document.getElementsByClassName('price-title') &&
     document.getElementsByClassName('price-title')[0] &&
     document.getElementsByClassName('price-title')[0].children[1] &&
     document.getElementById('resume-zone') &&
     document.getElementById('resume-zone').children[0] &&
     document.getElementById('resume-zone').children[0].children[0] &&
     document.getElementById('resume-zone').children[0].children[0].children[0] &&
     document.getElementById('resume-zone').children[0].children[0].children[1] &&
     document.getElementById('resume-zone').children[0].children[0].children[1].children[0] &&
     document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[0] &&
     document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[1] &&
     document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[2] &&
     document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[3] &&
     document.getElementById('resume-zone').children[0].children[0].children[2] &&
     document.getElementById('resume-zone').children[0].children[0].children[2].children[0] &&
     document.getElementById('resume-zone').children[0].children[0].children[2].children[0].children[1] &&
     document.getElementById('resume-zone').children[0].children[0].children[2].children[0].children[3] &&
     document.getElementById('resume-zone').children[0].children[0].children[3] &&
     document.getElementById('resume-zone').children[0].children[0].children[3].children[0] &&
     document.getElementById('resume-zone').children[0].children[0].children[3].children[0].children[1]
    ){

    var imageUrl = "http://" + document.getElementById('photo-zone').children[0].getAttribute('src').substring(2);
    var price = document.getElementsByClassName('price-title')[0].children[1].innerText.trim().split(" ")[1];
    var title = document.getElementById('resume-zone').children[0].children[0].children[0].innerText.trim().replace("\n", "");
    var sku = document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[0].innerText.trim();
    var partNumber = document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[1].innerText.trim();
    var upc = document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[2].innerText.trim();
    var maker = document.getElementById('resume-zone').children[0].children[0].children[1].children[0].children[3].innerText.trim();
    var category = document.getElementById('resume-zone').children[0].children[0].children[2].children[0].children[1].innerText.trim();
    var subcategory = document.getElementById('resume-zone').children[0].children[0].children[2].children[0].children[3].innerText.trim();
    var msrp = document.getElementById('resume-zone').children[0].children[0].children[3].children[0].children[1].innerText.trim().split(" ")[1];
    var dims = dimensions();
    var inv = inventory();
    var specs = specifications();
    
    return {
      proveedor: "Ingram",
      url: window.location.href,
      titulo: title,
      foto_url: imageUrl,
      sku: sku,
      numero_de_parte: partNumber,
      upc: upc,
      fabricante: maker,
      categoria: category,
      subcategoria: subcategory,
      msrp: msrp,
      precio: price,
      especificaciones: specs,
      dimensiones: dims,
      existencias: inv
    }

  }
  else {
    return {};
  }
}

function loadTechSpecs(options) {
  if (document.getElementById(options.specsTabSelector)) {
    document.getElementById(options.specsTabSelector).click();
  } 
}

/* END BROWSER EVALUATED FUNCTIONS */






/* APPLICATION LOGIC FUNCTIONS */

function scrapeProducts(phantom, page, args) {
  const productUrls = args[0];
  let i = 0;

  function nextProduct(){
    if(i >= productUrls.length){
      exit(phantom, SUCCESS_EXIT_CODE);
    }
    info(`Processing product ${i+1} out of ${productUrls.length}.`);
    handleProductPage(productUrls[i]);
    i++;
  }

  function handleProductPage(url){
    page.open(url, function(status){
      exitOnFailedStatus(phantom, page, status);
  
      /* click on the technical specs tab to load them into the DOM */
      page.evaluate(loadTechSpecs, { specsTabSelector: SPECS_TAB_SELECTOR });

      window.setTimeout(function() {
        const data = page.evaluate(productData);
        if (_.isEmpty(data)) {
          info(`Could not retrieve information for product at: ${url}`);
        }
        else {
          log(JSON.stringify(data), 'DATA');          
        }
        nextProduct();
      }, SPECS_LOAD_WAIT_TIME);
    });
  }

  nextProduct();  
}

/* END APPLICATION LOGIC FUNCTIONS */




function parseAndValidateCmdLineArgs(phantom) {
  const fs = require('fs');
  const system = require('system');
  const args = system.args;

  if (args.length !== 2) {
    error('Usage: phantomjs product_scraper.js [url_file]');
    exit(phantom, ERROR_EXIT_CODE);
  }
  const urlFile = args[1];

  if(!fs.exists(urlFile) || !fs.isFile(urlFile)) {
    error(`File does not exist: ${urlFile}`);
    exit(phantom, ERROR_EXIT_CODE);
  }

  return fs.read(urlFile).trim().split('\n');
}

function run(phantom) {
  const productUrls = parseAndValidateCmdLineArgs(phantom);

  const page = require('webpage').create();
  configurePhantomJS(phantom, page);

  info(`Starting product scraper for ${productUrls.length} product urls.`);
  /* Login and then proceed to scrapeProducts function */
  login(phantom, page, scrapeProducts, productUrls);
}

run(phantom);
