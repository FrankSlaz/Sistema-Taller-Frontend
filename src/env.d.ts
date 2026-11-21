/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    /** Nombre y logo del taller, cargados por src/middleware.ts. */
    branding: import('./lib/branding').Branding;
  }
}
