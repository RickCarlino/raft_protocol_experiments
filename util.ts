import {
  POLLING_INTERVAL_HI,
  POLLING_INTERVAL_LO
} from "./consts";

export const randomInterval = () => {
  return Math.floor(Math.random() * POLLING_INTERVAL_HI) + POLLING_INTERVAL_LO;
}

export function randomPolling(callback: Function, timeout = randomInterval()) {
  setTimeout(() => { callback(timeout); randomPolling(callback); }, timeout);
}

export let timestamp = () => new Date().getTime();

/** Get the diff between two times. If you only provide one timestamp, diff is
 * with current timestamp() */
export let timeDiff = (older, newer = timestamp()) => newer - older;
