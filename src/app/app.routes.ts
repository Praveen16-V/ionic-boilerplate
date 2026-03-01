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
    path: "profile",
    component: HomePage, // Temporary - use HomePage until profile page is created
  },
  {
    path: "login",
    component: HomePage, // Temporary - use HomePage until login page is created
  },
  {
    path: "**",
    redirectTo: "/home",
  },
];

export { routes };
