import { addCollection } from '@iconify/vue';
import antDesign from '@iconify-json/ant-design/icons.json';
import cil from '@iconify-json/cil/icons.json';
import gg from '@iconify-json/gg/icons.json';
import gridicons from '@iconify-json/gridicons/icons.json';
import iconPark from '@iconify-json/icon-park/icons.json';
import iconParkOutline from '@iconify-json/icon-park-outline/icons.json';
import ion from '@iconify-json/ion/icons.json';
import mdi from '@iconify-json/mdi/icons.json';
import uil from '@iconify-json/uil/icons.json';

/**
 * 注册离线 iconify 图标集
 * 菜单、按钮图标不依赖在线 API 即可渲染
 */
export function setupIcons() {
  addCollection(antDesign);
  addCollection(cil);
  addCollection(gg);
  addCollection(gridicons);
  addCollection(iconPark);
  addCollection(iconParkOutline);
  addCollection(ion);
  addCollection(mdi);
  addCollection(uil);
}
