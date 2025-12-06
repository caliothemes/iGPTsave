import Pricing from './pages/Pricing';
import Admin from './pages/Admin';
import Legal from './pages/Legal';
import MyVisuals from './pages/MyVisuals';
import AdminUsers from './pages/AdminUsers';
import AdminVisuals from './pages/AdminVisuals';
import AdminSettings from './pages/AdminSettings';
import Account from './pages/Account';
import AdminLegal from './pages/AdminLegal';
import AdminAssets from './pages/AdminAssets';
import AdminPricing from './pages/AdminPricing';
import PaymentSuccess from './pages/PaymentSuccess';
import AdminPresentation from './pages/AdminPresentation';
import Portfolio from './pages/Portfolio';
import Home from './pages/Home';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Pricing": Pricing,
    "Admin": Admin,
    "Legal": Legal,
    "MyVisuals": MyVisuals,
    "AdminUsers": AdminUsers,
    "AdminVisuals": AdminVisuals,
    "AdminSettings": AdminSettings,
    "Account": Account,
    "AdminLegal": AdminLegal,
    "AdminAssets": AdminAssets,
    "AdminPricing": AdminPricing,
    "PaymentSuccess": PaymentSuccess,
    "AdminPresentation": AdminPresentation,
    "Portfolio": Portfolio,
    "Home": Home,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};