import { sortLabs, type LabEntry } from './schema';

// Every file in ./labs is one lab; `npm run add-lab <slug>` writes them. Vite inlines them at build time.
const files = import.meta.glob<LabEntry>('./labs/*.json', { eager: true, import: 'default' });

export const LABS: LabEntry[] = sortLabs(Object.values(files));
