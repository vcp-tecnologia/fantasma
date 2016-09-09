import {
  error, 
  exit,
  info,
} from './utils';

import {
  USER_AGENT,
  RESOURCE_TIMEOUT,
  LOGGED_IN_URL,
  LOGIN_URL,
  ERROR_EXIT_CODE,
} from '../../config/settings';

export function configurePhantomJS(phantom, page) {
  info('Configuring PhantomJS with parameters:');
  info(`    USER_AGENT: ${USER_AGENT}`);
  info(`    TIMEOUT: ${RESOURCE_TIMEOUT} milliseconds`);
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
    exit(phantom, ERROR_EXIT_CODE);
  };

  page.settings.userAgent = USER_AGENT;
  page.settings.resourceTimeout = RESOURCE_TIMEOUT;

  page.onResourceTimeout = (e) => {
    error(`${e.errorString} Code: ${e.errorCode}, Url: ${e.url}`);
    if (e.url === LOGIN_URL || e.url === LOGGED_IN_URL){
      exit(phantom, ERROR_EXIT_CODE);
    }
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
    exit(phantom, ERROR_EXIT_CODE);
  };
}
