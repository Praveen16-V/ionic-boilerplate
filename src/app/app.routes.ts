import { Routes } from "@angular/router";
import { AboutPage } from "./pages/about/about.page";
import { HomePage } from "./pages/home/home.page";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/home",
    pathMatch: "full",
  },
  {
    path: "home",
    component: HomePage,
  },
  {
    path: "about",
    component: AboutPage,
  },
  {
    path: "**",
    redirectTo: "/home",
  },
];

export { routes };
