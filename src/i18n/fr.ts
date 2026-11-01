// French is the reference dictionary: en.ts must have exactly the same keys (the compiler checks it).
export const fr = {
  htmlLang: 'fr',
  meta: {
    title: 'Onigam Labs, des labs 3D pour comprendre l’énergie',
    description:
      'Des laboratoires 3D interactifs, gratuits et bilingues, pour comprendre comment l’eau, le vent et la chaleur font tourner des machines sans carburant.',
  },
  a11y: {
    skip: 'Aller au contenu',
    home: 'Onigam Labs, retour en haut',
    mainNav: 'Navigation principale',
    menu: 'Menu',
    menuClose: 'Fermer le menu',
    language: 'Langue',
    switchTo: 'Passer le site en français',
    themeToDark: 'Passer en mode sombre',
    themeToLight: 'Passer en mode clair',
    backToTop: 'Retour en haut de la page',
  },
  nav: { labs: 'Les labs', inside: 'Dans chaque lab', about: 'À propos' },
  hero: {
    title: 'Des machines sans carburant, à démonter pièce par pièce.',
    lead: 'Onigam Labs réunit des laboratoires 3D interactifs : on explore une turbine, un bélier hydraulique ou une éolienne, on la démonte, on la fait tourner dans une simulation. Gratuit, en français et en anglais, avec un guide parlé.',
    primary: 'Voir les labs',
    secondary: 'Code source sur GitHub',
    stepsLabel: 'Ce que l’on fait dans un lab',
    steps: [
      { name: 'Explorer', text: 'On tourne autour de la machine, on isole une pièce, on l’ouvre en coupe.' },
      {
        name: 'Démonter',
        text: 'Un éclaté sépare chaque pièce. Chacune a sa fiche : aperçu, caractéristiques, entretien.',
      },
      {
        name: 'Faire tourner',
        text: 'Une simulation en direct : on change la chute, le débit ou le vent, et on lit ce qui sort.',
      },
    ],
    drawing: {
      title: 'Schéma d’une roue Pelton',
      buckets: '26 augets',
      diameter: 'Ø 244 mm',
      hub: 'moyeu',
      generator: 'génératrice',
      power: 'électricité',
      shaft: 'arbre',
      jet: 'jet',
    },
  },
  labs: {
    title: 'Les labs',
    lead: 'Chaque lab est un site à part : on l’ouvre, on joue, on revient ici pour choisir le suivant.',
    filterLabel: 'Filtrer par domaine',
    all: 'Tous',
    resultCount: (n: number) => (n === 1 ? '1 lab affiché' : `${n} labs affichés`),
    groups: {
      live: 'En ligne',
      building: 'En construction',
      planned: 'À venir',
    },
    plannedNote: 'Pas de date : un lab sort quand il est prêt.',
    buildingNote: 'Le dépôt est public, le lab n’est pas encore ouvert.',
  },
  card: {
    level: 'Niveau',
    time: 'Durée',
    languages: 'Langues',
    spoken: 'Guide parlé',
    spokenNone: 'Pas encore',
    spokenNote: 'voix de synthèse',
    minutes: (n: number) => `${n} min`,
    open: 'Ouvrir le lab',
    source: 'Code source',
    follow: 'Suivre sur GitHub',
    soon: 'À venir',
    inProgress: 'En construction',
    forLab: (title: string) => ` ${title}`,
  },
  tour: {
    button: 'Visite guidée',
    buttonAria: (duration: string) => `Écouter la visite guidée, ${duration}, voix de synthèse`,
    headerAria: 'Visite guidée vocale',
    region: 'Visite guidée vocale',
    play: 'Lecture',
    pause: 'Pause',
    replay: 'Réécouter',
    position: 'Position dans la visite',
    speed: (speed: string) => `Vitesse ${speed} fois`,
    captions: 'Sous-titres',
    guidance: 'Guidage',
    guidanceOn: 'Le guidage fait défiler la page avec la voix',
    resume: 'Reprendre le guidage',
    close: 'Fermer la visite guidée',
    voice: 'Voix de synthèse',
    unavailable: 'L’audio n’a pas pu être chargé.',
  },
  difficulty: { 1: 'Facile', 2: 'Intermédiaire', 3: 'Avancé' },
  domains: { electricity: 'Électricité', heat: 'Chaleur', water: 'Eau', storage: 'Stockage' },
  tags: {
    hydro: 'Hydroélectricité',
    hydraulics: 'Hydraulique',
    wind: 'Vent',
    solar: 'Solaire',
    wood: 'Bois',
    biogas: 'Biogaz',
    passive: 'Passif',
    'off-grid': 'Hors réseau',
  } as Record<string, string>,
  inside: {
    title: 'Dans chaque lab',
    lead: 'Les labs partagent le même cadre : on retrouve ses repères d’un lab à l’autre.',
    items: [
      { name: 'Mondes 3D', text: 'Le site, l’appareil, ses organes : plusieurs vues, de l’ensemble jusqu’au détail.' },
      { name: 'Pièces', text: 'Une fiche par pièce : aperçu, caractéristiques, entretien. On l’isole, on la centre.' },
      { name: 'Montage', text: 'Un guide pas à pas qui assemble la machine, puis l’installe sur son site.' },
      { name: 'Simulation', text: 'Un modèle physique qui tourne en direct, avec des scénarios et des mesures.' },
      {
        name: 'Plans et leçons',
        text: 'Des planches A3 tirées des mêmes cotes que la 3D, et de courtes leçons avec un quiz.',
      },
      {
        name: 'Guide parlé',
        text: 'Un narrateur présente le lab et déplace la caméra pendant qu’il parle. Voix de synthèse, sous-titrée.',
      },
      {
        name: 'Sources',
        text: 'Les sources sont créditées, et ce qui est estimé n’est jamais présenté comme mesuré.',
      },
    ],
  },
  about: {
    title: 'À propos et crédits',
    paragraphs: [
      'Onigam Labs est un projet personnel de Magino. Chaque lab reconstitue, pour apprendre, une machine vue dans une vidéo publique : c’est une reconstitution pédagogique indépendante, ni un plan officiel ni un produit de constructeur.',
      'Aucune image ni séquence de ces vidéos n’est reprise. Les sources sont créditées dans chaque lab, onglet Sources, et plus bas. Les chiffres viennent de la simulation, sauf quand la source est citée.',
      'Les guides parlés sont lus par une voix de synthèse, toujours signalée comme telle.',
      'Ces labs servent à comprendre, pas à construire sans précaution : l’électricité, l’eau, le feu et le gaz demandent des règles, parfois une autorisation. Ce n’est pas un bureau d’études.',
    ],
    sourcesTitle: 'Sources par lab',
    sourcesLead: 'Les vidéos et documents qui ont servi de base. Merci à leurs auteurs.',
    openTitle: 'Code ouvert',
    openText:
      'Le code de chaque lab est public, sous licence MIT. Tous partagent le même socle, lab-kit : même cadre, mêmes outils, mêmes repères.',
    kit: 'lab-kit sur GitHub',
    profile: 'Magino sur GitHub',
  },
  footer: {
    licence: 'Licence MIT',
    privacy: 'Pas de cookies, pas de statistiques.',
    privacyLink: 'Confidentialité',
  },
  privacyPage: {
    title: 'Confidentialité',
    description:
      'Ce que le site, les labs et l’outil d’envoi de films font de vos données : presque rien, et voici le détail.',
    updated: 'Mise à jour le 1er novembre 2026.',
    back: 'Retour aux labs',
    sections: [
      {
        title: 'L’essentiel',
        paragraphs: [
          'Ni ce site ni les labs ne demandent de compte ou d’adresse e-mail. Ils ne posent aucun cookie et n’utilisent aucun outil de statistiques ni de publicité.',
        ],
      },
      {
        title: 'Ce qui reste dans votre navigateur',
        paragraphs: [
          'Vos préférences sont gardées dans votre navigateur et ne sont envoyées nulle part : la langue, le thème, les réglages du guide parlé et votre progression dans les leçons. Vous pouvez les effacer en supprimant les données du site dans votre navigateur.',
        ],
      },
      {
        title: 'Hébergement',
        paragraphs: [
          'Le site et les labs sont hébergés par Vercel. Comme tout hébergeur, Vercel reçoit des informations techniques pour servir les pages, dont votre adresse IP : voir ses [règles de confidentialité](https://vercel.com/legal/privacy-policy).',
        ],
      },
      {
        title: 'Polices de caractères',
        paragraphs: [
          'Ce site héberge lui-même ses polices. Les labs chargent les leurs depuis Google Fonts : votre navigateur contacte alors Google, qui reçoit votre adresse IP, selon ses [règles de confidentialité](https://policies.google.com/privacy).',
        ],
      },
      {
        title: 'Liens vers d’autres sites',
        paragraphs: [
          'Les liens vers YouTube, GitHub ou les sources des labs mènent à des sites qui ont leurs propres règles. Aucune vidéo n’est intégrée à ce site.',
        ],
      },
      {
        title: 'L’application Onigam Video et les services d’API YouTube',
        paragraphs: [
          'Onigam Video est un outil privé. Il sert uniquement à la personne qui tient ce site à envoyer ses propres films sur sa propre chaîne YouTube, Onigam Labs, par les services d’API YouTube. Il n’est pas ouvert au public et n’accède aux données d’aucun autre utilisateur ni d’aucun visiteur.',
          'Il ne touche qu’à cette chaîne : envoyer une vidéo, poser ses titres, ses descriptions, sa miniature et ses sous-titres, et relire ce que YouTube a reçu. Les identifiants d’accès restent sur son ordinateur. Aucune de ces données n’est vendue, ni utilisée pour de la publicité, ni conservée sur un serveur.',
          'Cet outil est lancé avec l’aide d’un assistant IA (Claude, d’Anthropic) : les informations de cette chaîne peuvent donc passer par cet assistant.',
          'Cet usage est soumis aux [conditions d’utilisation de YouTube](https://www.youtube.com/t/terms) et aux [règles de confidentialité de Google](https://policies.google.com/privacy). L’accès se retire à tout moment dans les [paramètres de sécurité du compte Google](https://myaccount.google.com/permissions).',
        ],
      },
      {
        title: 'Contact',
        paragraphs: [
          'Pour toute question sur cette page, ouvrez un [ticket sur GitHub](https://github.com/Onigam/onigam-labs/issues). Si elle change, la date ci-dessus change aussi.',
        ],
      },
    ],
  },
};

export type Dict = typeof fr;
