# Onigam Labs

The showcase of the **Onigam labs**: interactive 3D labs that explain how water, wind and heat drive machines that need no fuel.
Each lab is an independent site (a Pelton turbine, a hydraulic ram, a wind turbine…); this site is their front door, in
French and English.

**▶ https://onigam-labs.vercel.app** · French at `/`, English at `/en/` · light and dark · desktop, tablet and phone

🇫🇷 [Version française plus bas](#français)

> The labs are independent educational reconstructions of machines seen in public videos. They are not official drawings
> nor makers' products, and no image or footage of those videos is reused. Each lab credits its sources; this site lists
> them too (About and credits).

## What is in it

- **Hero**: a Pelton runner drawn as a technical diagram. As the page scrolls (the hero stays pinned on wide screens) it
  turns, comes apart and runs again, to show what a lab lets you do: explore, take apart, run. With reduced motion
  nothing moves by itself and the three steps become buttons.
- **Gallery**: one card per lab with a thumbnail of its key device (centred, exploded or in section), tagline, domains
  (electricity, heat, water, storage), level, time, languages, a **spoken guide** badge (always labelled _synthetic
  voice_) and links to the live lab and its source. Labs in progress and labs to come are shown without dates.
- **Inside every lab**, **About and credits** (sources by lab, safety, open code).
- French and English with the same content (a test compares them), a language switch, a theme toggle that follows the system
  until you choose, keyboard and screen-reader friendly, no cookies and no analytics.

## Stack

Vite + TypeScript, vanilla DOM, no framework: the same stack as the labs. The pages are **prerendered at build time** (complete
HTML for `/` and `/en/`, so there is no flash and search engines read them), then a few kilobytes of script add the pinned
hero, the filters and the theme. Fonts (Space Grotesk and JetBrains Mono, the labs' own) are self-hosted. Deployed on Vercel from `main`.

```bash
npm install
npm run dev          # http://localhost:5173 (add /en/ for English)
npm run build        # typecheck, check the lab entries, build, prerender fr + en into dist/
npm test             # lab entries, FR/EN parity, structure of the page
```

## Add a lab (one command)

Every lab is one file, `src/data/labs/<slug>.json`. For a lab that is finished and online:

```bash
npm run add-lab <slug>            # e.g. npm run add-lab solar-heater-lab
```

It reads the lab's `public/lab.json` (from `../<slug>` if you have the folder, else from `https://<slug>.vercel.app/lab.json`),
finds which spoken guides it ships (its `audio/<lang>/manifest.json`), takes the **thumbnails** in both languages with headless
Chrome (a few minutes: the 3D scene is rendered in software), writes the entry and checks it. Then:

```bash
npm run build                     # fails if an entry is incomplete
git add src/data/labs public/labs && git commit -m "Add <lab>" && git push    # Vercel publishes it
```

The card appears in the right group by itself (`live` → Online, `building` → In progress, `planned` → Coming).

**Frame the thumbnail on the key device.** The shot is the 3D canvas only, cropped to 4:3. Choose the world, how exploded
it is, and a zoom; the choice is saved in the entry so a refresh frames it the same way:

```bash
npm run add-lab pelton-lab -- --scene turbine --explode 0.65 --zoom 1.1 --focus 0.5,0.55
npm run add-lab ram-pump-lab -- --scene ram --cutaway           # in section instead
npm run add-lab <slug> -- --capture-only                         # only take the thumbnails again
```

(`--scene` is a world id of the lab, the one used in its URL hash: `https://pelton-lab.vercel.app/#turbine`.)

Other cases:

| You want to…                            | Do                                                                                                 |
| --------------------------------------- | -------------------------------------------------------------------------------------------------- |
| show a lab that is being built          | `npm run add-lab <slug> -- --status building` (a card with a link to its repository, no live link) |
| announce a lab without a repository yet | copy a `planned` file (e.g. `src/data/labs/gasifier-lab.json`) and edit the texts                  |
| promote a lab to online                 | `npm run add-lab <slug>`: status becomes `live`, thumbnails are taken, the entry is checked        |
| refresh every lab from its `lab.json`   | `npm run add-lab -- --all`                                                                         |
| credit the sources                      | edit `sources` in the entry (or put a `sources` array in the lab's `lab.json`: it is copied)       |

An entry looks like this (`src/data/schema.ts` is the reference, and the build checks it):

```json
{
  "slug": "ram-pump-lab",
  "order": 2,
  "status": "live",
  "title": { "fr": "Labo du bélier hydraulique", "en": "Hydraulic Ram Lab" },
  "tagline": { "fr": "Pomper l’eau sans électricité ni carburant", "en": "Pumping water with no electricity or fuel" },
  "domains": ["water"],
  "tags": ["hydraulics", "off-grid"],
  "difficulty": 2,
  "minutes": 20,
  "languages": ["fr", "en"],
  "spokenGuide": ["fr", "en"],
  "liveUrl": "https://ram-pump-lab.vercel.app",
  "repoUrl": "https://github.com/Onigam/ram-pump-lab",
  "thumbnail": "ram-pump-lab",
  "capture": { "scene": "ram", "explode": 0.6, "zoom": 1.35 },
  "sources": [{ "title": "…", "author": "…", "url": "https://…", "year": 2024 }]
}
```

`add-lab` maps the tags of `lab.json` to the four domains (`wind` → electricity, `hydraulics` → water, `hydro` → water and
electricity…); the other tags stay as free tags, translated by `src/i18n` when it knows them. A lab whose `lab.json` is still the
template's cannot be added as `live`.

## Domain and address

The site lives at the root of its own domain: asset paths are absolute and the English page is `/en/`. The prerender writes
canonical links, `hreflang`, the sitemap and the share images' addresses from `SITE_URL` (default `https://onigam-labs.vercel.app`,
or Vercel's production URL). Once a domain is chosen (for example `labs.onigam.io`), add it in the Vercel project settings and set
`SITE_URL` there, then redeploy.

Share images (`public/og-fr.png`, `public/og-en.png`) are taken from the built site: `npm run build && npm run og`.

## Credits and licence

By Magino · MIT licence. Fonts: [Space Grotesk](https://github.com/floriankarsten/space-grotesk) and
[JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) (SIL Open Font License). The labs share the frame of
[lab-kit](https://github.com/Onigam/lab-kit).

---

# Français

La vitrine des **labs Onigam** : des laboratoires 3D interactifs qui expliquent comment l’eau, le vent et la chaleur font tourner
des machines sans carburant. Chaque lab est un site indépendant (turbine Pelton, bélier hydraulique, éolienne…) ; ce site en est la
porte d’entrée, en français et en anglais.

**▶ https://onigam-labs.vercel.app** · français sur `/`, anglais sur `/en/` · clair et sombre · ordinateur, tablette et téléphone

> Les labs sont des reconstitutions pédagogiques indépendantes de machines vues dans des vidéos publiques. Ce ne sont ni des plans
> officiels ni des produits de constructeur, et aucune image ni séquence de ces vidéos n’est reprise. Chaque lab crédite ses
> sources ; ce site les liste aussi (« À propos et crédits »).

## Ce qu’il y a dedans

- **Accueil** : une roue Pelton dessinée comme un schéma technique. Quand on fait défiler la page (l’accueil reste épinglé sur grand
  écran), elle tourne, se démonte et refonctionne, pour montrer ce que permet un lab : explorer, démonter, faire tourner. Avec
  « réduire les animations », rien ne bouge seul et les trois étapes deviennent des boutons.
- **Galerie** : une carte par lab avec la vignette de son appareil clé (centré, éclaté ou en coupe), l’accroche, les domaines
  (électricité, chaleur, eau, stockage), le niveau, la durée, les langues, un badge **guide parlé** (toujours indiqué _voix de
  synthèse_) et les liens vers le lab en ligne et son code. Les labs en construction et à venir sont montrés sans date.
- **Dans chaque lab**, **À propos et crédits** (sources par lab, sécurité, code ouvert).
- Français et anglais à contenu égal (un test les compare), bouton de langue, thème qui suit le système tant qu’on n’a pas choisi,
  utilisable au clavier et au lecteur d’écran, ni cookies ni statistiques.

## Pile technique

Vite + TypeScript, DOM sans framework, comme les labs. Les pages sont **pré-rendues à la construction** (HTML complet pour `/` et
`/en/` : pas de clignotement, et les moteurs de recherche les lisent) ; quelques kilo-octets de script ajoutent l’accueil épinglé,
les filtres et le thème. Les polices (Space Grotesk et JetBrains Mono, celles des labs) sont hébergées avec le site. Déployé sur Vercel depuis `main`.

```bash
npm install
npm run dev          # http://localhost:5173 (ajouter /en/ pour l’anglais)
npm run build        # types, contrôle des fiches de labs, construction, pré-rendu fr + en dans dist/
npm test             # fiches de labs, parité FR/EN, structure de la page
```

## Ajouter un lab (une commande)

Chaque lab est un fichier, `src/data/labs/<slug>.json`. Pour un lab terminé et en ligne :

```bash
npm run add-lab <slug>            # par exemple : npm run add-lab solar-heater-lab
```

La commande lit le `public/lab.json` du lab (dans `../<slug>` si le dossier est là, sinon sur `https://<slug>.vercel.app/lab.json`),
repère les guides parlés (son `audio/<langue>/manifest.json`), prend les **vignettes** dans les deux langues avec Chrome sans écran
(quelques minutes : la 3D est calculée par logiciel), écrit la fiche et la vérifie. Ensuite :

```bash
npm run build                     # échoue si une fiche est incomplète
git add src/data/labs public/labs && git commit -m "Add <lab>" && git push    # Vercel publie
```

La carte apparaît toute seule dans le bon groupe (`live` → En ligne, `building` → En construction, `planned` → À venir).

**Cadrer la vignette sur l’appareil clé.** La vue est le canevas 3D seul, recadré en 4:3. On choisit le monde, l’éclaté et le zoom ;
le choix est gardé dans la fiche, donc un rafraîchissement cadre pareil :

```bash
npm run add-lab pelton-lab -- --scene turbine --explode 0.65 --zoom 1.1 --focus 0.5,0.55
npm run add-lab ram-pump-lab -- --scene ram --cutaway           # en coupe plutôt
npm run add-lab <slug> -- --capture-only                         # refaire seulement les vignettes
```

(`--scene` est l’identifiant d’un monde du lab, celui de son adresse : `https://pelton-lab.vercel.app/#turbine`.)

Autres cas :

| Vous voulez…                                    | Faites                                                                                                    |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| montrer un lab en construction                  | `npm run add-lab <slug> -- --status building` (carte avec lien vers le dépôt, sans lien vers le lab)      |
| annoncer un lab sans dépôt                      | copier un fichier `planned` (ex. `src/data/labs/gasifier-lab.json`) et changer les textes                 |
| passer un lab en ligne                          | `npm run add-lab <slug>` : statut `live`, vignettes prises, fiche vérifiée                                |
| rafraîchir tous les labs depuis leur `lab.json` | `npm run add-lab -- --all`                                                                                |
| créditer les sources                            | éditer `sources` dans la fiche (ou mettre un tableau `sources` dans le `lab.json` du lab : il est repris) |

`src/data/schema.ts` décrit une fiche et le build la contrôle. `add-lab` convertit les étiquettes de `lab.json` en quatre domaines
(`wind` → électricité, `hydraulics` → eau, `hydro` → eau et électricité…) ; les autres restent des étiquettes libres, traduites par
`src/i18n` quand elle les connaît. Un lab dont le `lab.json` est encore celui du modèle ne peut pas être ajouté en `live`.

## Domaine et adresse

Le site vit à la racine de son propre domaine : les chemins sont absolus et la page anglaise est `/en/`. Le pré-rendu écrit les liens
canoniques, `hreflang`, le plan du site et les adresses des images de partage à partir de `SITE_URL` (par défaut
`https://onigam-labs.vercel.app`, ou l’adresse de production de Vercel). Quand le domaine est choisi (par exemple `labs.onigam.io`),
l’ajouter dans les réglages du projet Vercel, définir `SITE_URL` là-bas, puis redéployer.

Les images de partage (`public/og-fr.png`, `public/og-en.png`) sont prises depuis le site construit : `npm run build && npm run og`.

## Crédits et licence

Par Magino · licence MIT. Polices : [Space Grotesk](https://github.com/floriankarsten/space-grotesk) et
[JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) (SIL Open Font License). Les labs partagent le cadre de
[lab-kit](https://github.com/Onigam/lab-kit).
