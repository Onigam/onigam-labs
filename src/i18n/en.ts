import type { Dict } from './fr';

// English is an adaptation, not a word-for-word translation (British spelling).
export const en: Dict = {
  htmlLang: 'en',
  meta: {
    title: 'Onigam Labs: 3D labs to understand energy',
    description:
      'Interactive 3D labs, free and bilingual, to understand how water, wind and heat drive machines that need no fuel.',
  },
  a11y: {
    skip: 'Skip to content',
    home: 'Onigam Labs, back to the top',
    mainNav: 'Main navigation',
    menu: 'Menu',
    menuClose: 'Close the menu',
    language: 'Language',
    switchTo: 'Switch the site to English',
    themeToDark: 'Switch to dark mode',
    themeToLight: 'Switch to light mode',
    backToTop: 'Back to the top of the page',
  },
  nav: { labs: 'The labs', inside: 'Inside every lab', about: 'About' },
  hero: {
    title: 'Fuel-free machines you can take apart, piece by piece.',
    lead: 'Onigam Labs gathers interactive 3D labs: explore a turbine, a hydraulic ram or a wind turbine, take it apart, run it in a simulation. Free, in French and English, with a spoken guide.',
    primary: 'Browse the labs',
    secondary: 'Source code on GitHub',
    stepsLabel: 'What you do in a lab',
    steps: [
      { name: 'Explore', text: 'Orbit the machine, isolate a part, cut it open.' },
      {
        name: 'Take apart',
        text: 'An exploded view separates every part. Each one has its sheet: overview, specifications, upkeep.',
      },
      {
        name: 'Run it',
        text: 'A live simulation: change the head, the flow or the wind, and read what comes out.',
      },
    ],
    drawing: {
      title: 'Diagram of a Pelton runner',
      buckets: '26 buckets',
      diameter: 'Ø 244 mm',
      hub: 'hub',
      generator: 'generator',
      power: 'electricity',
      shaft: 'shaft',
      jet: 'jet',
    },
  },
  labs: {
    title: 'The labs',
    lead: 'Each lab is a site of its own: open it, play with it, come back here to pick the next one.',
    filterLabel: 'Filter by field',
    all: 'All',
    resultCount: (n: number) => (n === 1 ? '1 lab shown' : `${n} labs shown`),
    groups: {
      live: 'Online',
      building: 'In progress',
      planned: 'Coming',
    },
    plannedNote: 'No dates: a lab ships when it is ready.',
    buildingNote: 'The repository is public, the lab is not open yet.',
  },
  card: {
    level: 'Level',
    time: 'Time',
    languages: 'Languages',
    spoken: 'Spoken guide',
    spokenNone: 'Not yet',
    spokenNote: 'synthetic voice',
    minutes: (n: number) => `${n} min`,
    open: 'Open the lab',
    source: 'Source code',
    follow: 'Follow on GitHub',
    soon: 'Coming',
    inProgress: 'In progress',
    forLab: (title: string) => ` ${title}`,
  },
  tour: {
    button: 'Guided tour',
    buttonAria: (duration: string) => `Listen to the guided tour, ${duration}, synthetic voice`,
    headerAria: 'Spoken guided tour',
    region: 'Spoken guided tour',
    play: 'Play',
    pause: 'Pause',
    replay: 'Listen again',
    position: 'Position in the tour',
    speed: (speed: string) => `Speed ${speed} times`,
    captions: 'Subtitles',
    guidance: 'Guidance',
    guidanceOn: 'Guidance scrolls the page along with the voice',
    resume: 'Resume guidance',
    close: 'Close the guided tour',
    voice: 'Synthetic voice',
    unavailable: 'The audio could not be loaded.',
  },
  difficulty: { 1: 'Easy', 2: 'Intermediate', 3: 'Advanced' },
  domains: { electricity: 'Electricity', heat: 'Heat', water: 'Water', storage: 'Storage' },
  tags: {
    hydro: 'Hydropower',
    hydraulics: 'Hydraulics',
    wind: 'Wind',
    solar: 'Solar',
    wood: 'Wood',
    biogas: 'Biogas',
    passive: 'Passive',
    'off-grid': 'Off-grid',
  },
  inside: {
    title: 'Inside every lab',
    lead: 'The labs share one frame, so you find your bearings from one lab to the next.',
    items: [
      {
        name: '3D worlds',
        text: 'The site, the machine, its inner parts: several views, from the whole to the detail.',
      },
      { name: 'Parts', text: 'One sheet per part: overview, specifications, upkeep. Isolate it, centre on it.' },
      { name: 'Assembly', text: 'A step-by-step guide that builds the machine, then installs it on its site.' },
      { name: 'Simulation', text: 'A physics model that runs live, with scenarios and readings.' },
      {
        name: 'Drawings and lessons',
        text: 'A3 sheets drawn from the same dimensions as the 3D model, and short lessons with a quiz.',
      },
      {
        name: 'Spoken guide',
        text: 'A narrator introduces the lab and moves the camera as they speak. Synthetic voice, with subtitles.',
      },
      {
        name: 'Sources',
        text: 'Sources are credited, and what is estimated is never presented as measured.',
      },
    ],
  },
  about: {
    title: 'About and credits',
    paragraphs: [
      'Onigam Labs is a personal project by Magino. Each lab rebuilds, for learning, a machine seen in a public video: it is an independent educational reconstruction, neither an official drawing nor a maker’s product.',
      'No image or footage from those videos is reused. Sources are credited inside each lab, in the Sources tab, and below. Figures come from the simulation, except where a source is quoted.',
      'The spoken guides are read by a synthetic voice, always labelled as such.',
      'These labs are for understanding, not for building without care: electricity, water, fire and gas come with rules, sometimes a permit. This is not an engineering study.',
    ],
    sourcesTitle: 'Sources by lab',
    sourcesLead: 'The videos and documents each lab is based on. Thanks to their authors.',
    openTitle: 'Open code',
    openText:
      'Every lab’s code is public under the MIT licence. They all share one foundation, lab-kit: same frame, same tools, same bearings.',
    kit: 'lab-kit on GitHub',
    profile: 'Magino on GitHub',
  },
  footer: {
    licence: 'MIT licence',
    privacy: 'No cookies, no analytics.',
    privacyLink: 'Privacy',
  },
  privacyPage: {
    title: 'Privacy',
    description:
      'What the site, the labs and the film upload tool do with your data: next to nothing, and here is the detail.',
    updated: 'Updated on 1 November 2026.',
    back: 'Back to the labs',
    sections: [
      {
        title: 'The short version',
        paragraphs: [
          'Neither this site nor the labs ask for an account or an email address. They set no cookies and use no analytics or advertising tool.',
        ],
      },
      {
        title: 'What stays in your browser',
        paragraphs: [
          'Your preferences are kept in your browser and sent nowhere: the language, the theme, the spoken guide’s settings and your progress through the lessons. You can erase them by deleting the site’s data in your browser.',
        ],
      },
      {
        title: 'Hosting',
        paragraphs: [
          'The site and the labs are hosted by Vercel. Like any host, Vercel receives technical information to serve the pages, including your IP address: see its [privacy policy](https://vercel.com/legal/privacy-policy).',
        ],
      },
      {
        title: 'Fonts',
        paragraphs: [
          'This site hosts its own fonts. The labs load theirs from Google Fonts: your browser then contacts Google, which receives your IP address, under its [privacy policy](https://policies.google.com/privacy).',
        ],
      },
      {
        title: 'Links to other sites',
        paragraphs: [
          'Links to YouTube, GitHub or the labs’ sources lead to sites with their own rules. No video is embedded on this site.',
        ],
      },
      {
        title: 'The Onigam Video application and YouTube API Services',
        paragraphs: [
          'Onigam Video is a private tool. Its only use is for the person who runs this site to upload their own films to their own YouTube channel, Onigam Labs, through YouTube API Services. It is not open to the public and accesses no data of any other user or of any visitor.',
          'It only touches that channel: uploading a video, setting its titles, descriptions, thumbnail and captions, and reading back what YouTube received. The access credentials stay on that person’s computer. None of this data is sold, used for advertising or kept on a server.',
          'This tool is run with the help of an AI assistant (Claude, by Anthropic), so information from that channel may pass through the assistant.',
          'This use is subject to the [YouTube Terms of Service](https://www.youtube.com/t/terms) and the [Google Privacy Policy](https://policies.google.com/privacy). Access can be withdrawn at any time in the [Google account’s security settings](https://myaccount.google.com/permissions).',
        ],
      },
      {
        title: 'Contact',
        paragraphs: [
          'For any question about this page, open an [issue on GitHub](https://github.com/Onigam/onigam-labs/issues). If it changes, the date above changes too.',
        ],
      },
    ],
  },
};
