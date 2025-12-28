import Account from './pages/Account';
import Admin from './pages/Admin';
import AdminAssets from './pages/AdminAssets';
import AdminLegal from './pages/AdminLegal';
import AdminNewsletterTemplates from './pages/AdminNewsletterTemplates';
import AdminNewsletters from './pages/AdminNewsletters';
import AdminPresentation from './pages/AdminPresentation';
import AdminPricing from './pages/AdminPricing';
import AdminPrompts from './pages/AdminPrompts';
import AdminSettings from './pages/AdminSettings';
import AdminStoreCategories from './pages/AdminStoreCategories';
import AdminStoryAnimations from './pages/AdminStoryAnimations';
import AdminSupport from './pages/AdminSupport';
import AdminUserDetail from './pages/AdminUserDetail';
import AdminUsers from './pages/AdminUsers';
import AdminVisuals from './pages/AdminVisuals';
import Home from './pages/Home';
import homeBackup from './pages/Home_backup';
import Legal from './pages/Legal';
import MyVisuals from './pages/MyVisuals';
import PaymentSuccess from './pages/PaymentSuccess';
import Portfolio from './pages/Portfolio';
import Pricing from './pages/Pricing';
import Store from './pages/Store';
import StoryStudio from './pages/StoryStudio';
import Support from './pages/Support';
import AdminVideoPrompts from './pages/AdminVideoPrompts';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Account": Account,
    "Admin": Admin,
    "AdminAssets": AdminAssets,
    "AdminLegal": AdminLegal,
    "AdminNewsletterTemplates": AdminNewsletterTemplates,
    "AdminNewsletters": AdminNewsletters,
    "AdminPresentation": AdminPresentation,
    "AdminPricing": AdminPricing,
    "AdminPrompts": AdminPrompts,
    "AdminSettings": AdminSettings,
    "AdminStoreCategories": AdminStoreCategories,
    "AdminStoryAnimations": AdminStoryAnimations,
    "AdminSupport": AdminSupport,
    "AdminUserDetail": AdminUserDetail,
    "AdminUsers": AdminUsers,
    "AdminVisuals": AdminVisuals,
    "Home": Home,
    "Home_backup": homeBackup,
    "Legal": Legal,
    "MyVisuals": MyVisuals,
    "PaymentSuccess": PaymentSuccess,
    "Portfolio": Portfolio,
    "Pricing": Pricing,
    "Store": Store,
    "StoryStudio": StoryStudio,
    "Support": Support,
    "AdminVideoPrompts": AdminVideoPrompts,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};