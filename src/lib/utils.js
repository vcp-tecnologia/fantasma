/* @flow */

import {
  LOGIN_URL,
  LOGIN_FORM_USERNAME_SELECTOR,
  LOGIN_FORM_PASSWORD_SELECTOR,
  LOGIN_FORM_SUBMIT_SELECTOR,
  USERNAME,
  PASSWORD,
  LOGIN_WAIT_TIME,
  ERROR_EXIT_CODE,
  LOGOUT_URL,
} from '../../config/settings';

export const debug = (message: string): void => {
  log(message, "DEBUG");
}

export const error = (message: string): void => {
  log(message, "ERROR");
}

export const info = (message: string): void => {
  log(message, "INFO");
}

export const log = (message: string, label: string): void => {
  console.log(`${timestamp()} [APP ${label}] ${message}`);
}


export const exit = (phantom: any, exitCode: number): void => {
  info(`Exiting with code: ${exitCode}`);
  phantom.exit(exitCode);
}


export const exitOnFailedStatus = (phantom: any, page: any, status: string): void => {
  if (status === 'success') {
    info(`Successfully opened page: ${page.url}`);
    return;
  }
  else {
    error(`Failed to load page: ${page.url}`);
    logoff(phantom, page, ERROR_EXIT_CODE);
  }
}

export const logoff = (phantom: any, page: any, exitCode: number): void => {
  info('Attempting to log off.');
  page.open(LOGOUT_URL, (status) => {
    if (status === 'success') {
      info(`Successfully logged off. Url is: ${page.url}`);
      exit(phantom, exitCode);
    }
    else {
      error(`Failed to log off. Url is: ${page.url}`);
      exit(phantom, ERROR_EXIT_CODE);
    }
  });
}

export const login = (phantom: any, page: any, callback: any, ...args: Array<any>) => {
  page.open(LOGIN_URL, function(status){
    exitOnFailedStatus(phantom, page, status);

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
      if(page.url === LOGIN_URL) {
        error('Failed to log in.');
        exit(phantom, ERROR_EXIT_CODE);
      }
      else {
        info(`Successfully logged in. Current url is: ${page.url}`);
        callback(phantom, page, args);
      }
    }, LOGIN_WAIT_TIME);
  });
}






/**
* Return a timestamp with the format "yyyy-mm-dddThh:MM:ss"
*/
const timestamp = (): string => {
  /* Create a date object with the current time */
  const now = new Date();
  let date: Array<string> = [ String(now.getFullYear()),
                              String(now.getMonth() + 1),
                              String(now.getDate()) ];
  let time: Array<string> = [ String(now.getHours()),
                              String(now.getMinutes()),
                              String(now.getSeconds()) ];
  /* Pad with zeroes if necessary */
  for ( let i = 1; i < 3; i++ ) {
    if ( parseInt(date[i]) < 10 ) {
      date[i] = "0" + date[i];
    }
    if ( parseInt(time[i]) < 10 ) {
      time[i] = "0" + time[i];
    }
  }

  return date.join("-") + "T" + time.join(":");
}

const fillLoginForm = (options): void => {
  document.querySelector(options.usernameSelector).setAttribute('value', options.username);
  document.querySelector(options.passwordSelector).setAttribute('value', options.password);
  document.querySelector(options.submitSelector).click();
}
