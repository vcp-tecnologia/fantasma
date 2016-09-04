/* @flow */

import { timestamp } from './utils';

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
