import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';
import Legal from './pages/Legal';
import MyVisuals from './pages/MyVisuals';
import AdminUsers from './pages/AdminUsers';
import AdminVisuals from './pages/AdminVisuals';
import AdminSettings from './pages/AdminSettings';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Pricing": Pricing,
    "Admin": Admin,
    "Legal": Legal,
    "MyVisuals": MyVisuals,
    "AdminUsers": AdminUsers,
    "AdminVisuals": AdminVisuals,
    "AdminSettings": AdminSettings,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};