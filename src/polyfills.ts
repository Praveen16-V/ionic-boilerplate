/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates and
 * i18n is not yet included.
 *
 * This file can be safely removed if message localization is not needed.
 */
import '@angular/localize/init';

/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for most modern browsers. See https://angular.io/guide/browser-support
 * for more details.
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * By default, zone.js will patch all possible macroTask and DomEvents, user can disable parts
 * of macroTask/DomEvents patch by setting following flags because those flags are needed in
 * some browsers, due to their limitation of browsers.
 * For more details, please check:
 * https://github.com/angular/zone.js/blob/master/docs/zone-patch.md#how-to-disable-patching-of-some-macrotask-dom-events
 */
(window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
(window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
(window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames

/*
 * In IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 * with the following flag, it will bypass `zone.js` patch for IE/Edge
 */
(window as any).__Zone_enable_cross_context_check = true;

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.
