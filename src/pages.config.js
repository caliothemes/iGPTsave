/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Account from './pages/Account';
import Admin from './pages/Admin';
import AdminAssets from './pages/AdminAssets';
import AdminBackup from './pages/AdminBackup';
import AdminEffects from './pages/AdminEffects';
import AdminFeatures from './pages/AdminFeatures';
import AdminFiles from './pages/AdminFiles';
import AdminImageEditExamples from './pages/AdminImageEditExamples';
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
import AdminVideoExamples from './pages/AdminVideoExamples';
import AdminVideoPrompts from './pages/AdminVideoPrompts';
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
import AdminConversationalAI from './pages/AdminConversationalAI';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Account": Account,
    "Admin": Admin,
    "AdminAssets": AdminAssets,
    "AdminBackup": AdminBackup,
    "AdminEffects": AdminEffects,
    "AdminFeatures": AdminFeatures,
    "AdminFiles": AdminFiles,
    "AdminImageEditExamples": AdminImageEditExamples,
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
    "AdminVideoExamples": AdminVideoExamples,
    "AdminVideoPrompts": AdminVideoPrompts,
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
    "AdminConversationalAI": AdminConversationalAI,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};