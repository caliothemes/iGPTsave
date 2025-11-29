import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';
import Legal from './pages/Legal';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Pricing": Pricing,
    "Admin": Admin,
    "Legal": Legal,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};