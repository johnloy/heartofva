import day from "dayjs";
import { HOVA_TZ } from "../../assets/common/constants";

/**
 * @param {string} selector
 * @param {HTMLElement | ShadowRoot} [baseEl]
 * @returns {HTMLElement | null}
 */
export const $ = (selector, baseEl) => {
  baseEl = baseEl || ("document" in globalThis ? document.body : undefined);
  return baseEl.querySelector(selector);
};

/**
 * @param {string} selector
 * @param {HTMLElement | ShadowRoot} [baseEl]
 * @returns {NodeListOf<Element>}
 */
export const $$ = (selector, baseEl) => {
  baseEl = baseEl || ("document" in globalThis ? document.body : undefined);
  return baseEl.querySelectorAll(selector);
};

export const userTime = () => day().tz(HOVA_TZ);
