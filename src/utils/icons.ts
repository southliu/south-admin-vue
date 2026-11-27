import { addCollection, getIcon, setCustomIconLoader } from '@iconify/vue';
import initialIcons from '@/assets/icons.json';

for (const collection of Object.values(initialIcons)) addCollection(collection);
const pendingCollections = new Map<string, Promise<void>>();
for (const prefix of [
  'ant-design',
  'cil',
  'gg',
  'gridicons',
  'icon-park',
  'icon-park-outline',
  'ion',
  'mdi',
  'uil',
  'la',
  'fluent',
  'majesticons',
  'material-symbols',
]) {
  setCustomIconLoader(async (name) => {
    let pending = pendingCollections.get(prefix);
    if (!pending) {
      pending = fetch(`${import.meta.env.BASE_URL}icons/${prefix}.json`)
        .then(async (response) => {
          if (!response.ok)
            throw new Error(`Failed to load icons: ${response.status}`);
          addCollection(await response.json());
        })
        .catch((error: unknown) => {
          pendingCollections.delete(prefix);
          throw error;
        });
      pendingCollections.set(prefix, pending);
    }
    await pending;
    return getIcon(`${prefix}:${name}`) || null;
  }, prefix);
}
