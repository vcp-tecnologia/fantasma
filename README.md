# Fantasma App


---


### Directory Overview

```
/product_scraper
    /config       ->  config files (normally in JSON format)
    /data         ->  holds a .json file with sources
    /dist         ->  output folder for webpack bundle, i.e. runnable file
    /docs         ->  user documentation
    /src          ->  source code for app    
        /db       ->  code for interfacing with database
        /models   ->  object models
        /scrapers ->  classes for scraping Vendors off the web
        /utils    ->  utility code used around the app
```
---

### Technologies

The application is built on `Javascript ES6` (with some ES7 features like `async/await`, `import/export` module syntax) and runs on `NodeJS`. 
The code is transpiled down to `Javascript ES5` using `babel` and bundled into a single file usnig `webpack`. 
The code is sometimes type checked using [Facebook Flow](https://flowtype.org/).

---
### Development environment

You'll need to have `node`, `npm`, and `webpack` at the very least. The project has been tested to work with `node-v6.3.1`, `npm-v.3.10.5`, and `webpack-v.1.13.1`. `webpack` must be installed globally via: 

`$ npm install -g webpack`.

The rest of the dependencies will be local. To install them you need to run: 

`$ npm install` 

inside the application directory.

To make sure the application build correctly run:

`$ webpack`

which should issue no errors and output a `bundle.js` file to `/dist`.


---

### Configuring the application


---

### Setting Up the local DB of organizations (OPTIONAL)

---

### Setting Up Sources

---

### Running the application

To run the application make sure all dependecies are installed via:

`$ npm install`

And build the project file via:

`$ npm run build`

Once those two commands succeed without errors run the application via:

`$ npm start`

---
