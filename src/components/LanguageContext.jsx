import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Home
    welcome: "Bienvenue sur **VisualGPT** ! 👋",
    welcomeUser: "Bonjour {name} ! 👋",
    assistantIntro: "Je suis **VisualGPT**. Décrivez-moi le visuel que vous souhaitez créer et je m'en occupe !",
    guestIntro: "Décrivez-moi ce que vous souhaitez créer.\n\n*Connectez-vous pour sauvegarder vos créations et bénéficier de 5 téléchargements gratuits.*",
    newConversation: "Nouvelle conversation ! Que souhaitez-vous créer ?",
    heroTitle: "Votre assistant IA pour créer des visuels professionnels",
    heroSubtitle: "Logos, cartes de visite, flyers, posts pour réseaux sociaux... Décrivez votre besoin et laissez l'IA créer pour vous.",
    inputPlaceholder: "Décrivez votre visuel...",
    generating: "🎨 Génération en cours...",
    ready: "est prêt !",
    connectToDownload: "Connectez-vous pour télécharger.",
    error: "❌ Erreur. Réessayez.",
    newVersion: "✨ Nouvelle version générée !",
    thinking: "Réflexion...",
    
    // Sidebar
    newCreation: "Nouvelle création",
    history: "Historique",
    noConversation: "Aucune conversation",
    myVisuals: "Mes visuels",
    others: "autres",
    credits: "crédits",
    free: "Gratuit",
    logout: "Déconnexion",
    login: "Connexion",
    
    // Format selector
    digital: "Digital",
    print: "Impression",
    postInstagram: "Post Instagram",
    storyInstagram: "Story Instagram",
    postFacebook: "Post Facebook",
    postLinkedin: "Post LinkedIn",
    webBanner: "Bannière Web",
    businessCard: "Carte de visite",
    flyerA5: "Flyer A5",
    posterA3: "Affiche A3",
    logoHD: "Logo HD",
    
    // Visual card
    regenerate: "Régénérer",
    download: "Télécharger",
    downloaded: "Téléchargé",
    noCredits: "Plus de crédits disponibles",
    
    // Pricing
    back: "Retour",
    chooseFormula: "Choisissez votre formule",
    unlockPotential: "Débloquez tout le potentiel de VisualGPT avec nos offres flexibles",
    currentCredits: "Crédits actuels",
    creditPacks: "Packs de crédits",
    popular: "Populaire",
    recommended: "Recommandé",
    buy: "Acheter",
    buying: "Achat...",
    subscribe: "Souscrire",
    subscribing: "Souscription...",
    subscriptions: "Abonnements",
    perMonth: "/mois",
    downloadsMonth: "téléchargements/mois",
    unlimited: "Téléchargements illimités",
    noWatermark: "Sans filigrane",
    hdFormats: "Formats HD",
    hdPrintFormats: "Formats HD & Print",
    prioritySupport: "Support prioritaire",
    vipSupport: "Support VIP",
    apiAccess: "API Access",
    securePayment: "Paiement sécurisé • Annulation à tout moment • Support 24/7",
    
    // Footer
    pricing: "Tarifs",
    legal: "Mentions légales",
    freeDownloads: "5 téléchargements gratuits",
    
    // Admin
    administration: "Administration",
    stats: "Statistiques",
    users: "Utilisateurs",
    visuals: "Visuels",
    settings: "Paramètres",
    totalRevenue: "Revenus totaux",
    downloads: "Téléchargements",
    conversations: "Conversations",
    activeSubscriptions: "Abonnements actifs",
    activity30Days: "Activité (30 jours)",
    revenue30Days: "Revenus (30 jours)",
    visualTypes: "Types de visuels",
    userManagement: "Gestion des utilisateurs",
    search: "Rechercher...",
    freeCredits: "Crédits gratuits",
    paidCredits: "Crédits payants",
    subscription: "Abonnement",
    actions: "Actions",
    generatedVisuals: "Visuels générés",
    homePage: "Page d'accueil",
    customizeHome: "Personnalisez le titre et sous-titre de l'accueil",
    mainTitle: "Titre principal",
    subtitle: "Sous-titre",
    save: "Sauvegarder",
    legalNotice: "Mentions légales",
    editLegal: "Modifiez le contenu des mentions légales",
    legalPlaceholder: "Contenu des mentions légales...",
    
    // Legal page
    legalTitle: "Mentions Légales",
    editor: "Éditeur du site",
    editorDesc: "Service de création de visuels assisté par intelligence artificielle",
    hosting: "Hébergement",
    hostingDesc: "Le site est hébergé par Base44\nInfrastructure cloud sécurisée",
    intellectualProperty: "Propriété intellectuelle",
    ipDesc: "Les visuels générés par VisualGPT sont la propriété de l'utilisateur qui les a créés, sous réserve du respect des conditions d'utilisation.",
    dataProtection: "Protection des données personnelles",
    dataDesc: "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles.",
    termsOfUse: "Conditions d'utilisation",
    refundPolicy: "Politique de remboursement",
    liability: "Limitation de responsabilité",
    contact: "Contact",
    lastUpdate: "Dernière mise à jour",
  },
  en: {
    // Home
    welcome: "Welcome to **VisualGPT**! 👋",
    welcomeUser: "Hello {name}! 👋",
    assistantIntro: "I'm **VisualGPT**. Describe the visual you want to create and I'll handle it!",
    guestIntro: "Describe what you want to create.\n\n*Sign in to save your creations and get 5 free downloads.*",
    newConversation: "New conversation! What would you like to create?",
    heroTitle: "Your AI assistant for creating professional visuals",
    heroSubtitle: "Logos, business cards, flyers, social media posts... Describe your need and let AI create for you.",
    inputPlaceholder: "Describe your visual...",
    generating: "🎨 Generating...",
    ready: "is ready!",
    connectToDownload: "Sign in to download.",
    error: "❌ Error. Please retry.",
    newVersion: "✨ New version generated!",
    thinking: "Thinking...",
    
    // Sidebar
    newCreation: "New creation",
    history: "History",
    noConversation: "No conversation",
    myVisuals: "My visuals",
    others: "others",
    credits: "credits",
    free: "Free",
    logout: "Logout",
    login: "Login",
    
    // Format selector
    digital: "Digital",
    print: "Print",
    postInstagram: "Instagram Post",
    storyInstagram: "Instagram Story",
    postFacebook: "Facebook Post",
    postLinkedin: "LinkedIn Post",
    webBanner: "Web Banner",
    businessCard: "Business Card",
    flyerA5: "A5 Flyer",
    posterA3: "A3 Poster",
    logoHD: "HD Logo",
    
    // Visual card
    regenerate: "Regenerate",
    download: "Download",
    downloaded: "Downloaded",
    noCredits: "No credits available",
    
    // Pricing
    back: "Back",
    chooseFormula: "Choose your plan",
    unlockPotential: "Unlock the full potential of VisualGPT with our flexible offers",
    currentCredits: "Current credits",
    creditPacks: "Credit packs",
    popular: "Popular",
    recommended: "Recommended",
    buy: "Buy",
    buying: "Buying...",
    subscribe: "Subscribe",
    subscribing: "Subscribing...",
    subscriptions: "Subscriptions",
    perMonth: "/month",
    downloadsMonth: "downloads/month",
    unlimited: "Unlimited downloads",
    noWatermark: "No watermark",
    hdFormats: "HD formats",
    hdPrintFormats: "HD & Print formats",
    prioritySupport: "Priority support",
    vipSupport: "VIP support",
    apiAccess: "API Access",
    securePayment: "Secure payment • Cancel anytime • 24/7 support",
    
    // Footer
    pricing: "Pricing",
    legal: "Legal notice",
    freeDownloads: "5 free downloads",
    
    // Admin
    administration: "Administration",
    stats: "Statistics",
    users: "Users",
    visuals: "Visuals",
    settings: "Settings",
    totalRevenue: "Total revenue",
    downloads: "Downloads",
    conversations: "Conversations",
    activeSubscriptions: "Active subscriptions",
    activity30Days: "Activity (30 days)",
    revenue30Days: "Revenue (30 days)",
    visualTypes: "Visual types",
    userManagement: "User management",
    search: "Search...",
    freeCredits: "Free credits",
    paidCredits: "Paid credits",
    subscription: "Subscription",
    actions: "Actions",
    generatedVisuals: "Generated visuals",
    homePage: "Home page",
    customizeHome: "Customize home title and subtitle",
    mainTitle: "Main title",
    subtitle: "Subtitle",
    save: "Save",
    legalNotice: "Legal notice",
    editLegal: "Edit legal notice content",
    legalPlaceholder: "Legal notice content...",
    
    // Legal page
    legalTitle: "Legal Notice",
    editor: "Site editor",
    editorDesc: "AI-assisted visual creation service",
    hosting: "Hosting",
    hostingDesc: "The site is hosted by Base44\nSecure cloud infrastructure",
    intellectualProperty: "Intellectual property",
    ipDesc: "Visuals generated by VisualGPT are the property of the user who created them, subject to compliance with terms of use.",
    dataProtection: "Personal data protection",
    dataDesc: "In accordance with GDPR, you have the right to access, rectify and delete your personal data.",
    termsOfUse: "Terms of use",
    refundPolicy: "Refund policy",
    liability: "Limitation of liability",
    contact: "Contact",
    lastUpdate: "Last update",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('visualgpt_lang') || 'fr';
    }
    return 'fr';
  });

  useEffect(() => {
    localStorage.setItem('visualgpt_lang', language);
  }, [language]);

  const t = (key, params = {}) => {
    let text = translations[language][key] || translations['fr'][key] || key;
    Object.keys(params).forEach(param => {
      text = text.replace(`{${param}}`, params[param]);
    });
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);