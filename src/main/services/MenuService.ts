import { t } from '@main/services/AppLocale';
import { isMacOS } from '@main/utils/systeminfo';
import { APP_NAME } from '@shared/config/appinfo';
import type { MenuItemConstructorOptions } from 'electron';
import { Menu } from 'electron';

export class MenuService {
  private static instance: MenuService;
  private contextMenu: Menu | null = null;

  constructor() {
    this.updateMenu(true);
    MenuService.instance = this;
  }

  public static getInstance() {
    return MenuService.instance;
  }

  private createMenu() {
    this.destroyMenu();

    this.updateContextMenu();

    if (!isMacOS) {
      return;
    }

    Menu.setApplicationMenu(this.contextMenu);
  }

  private updateContextMenu() {
    const template = [
      {
        label: APP_NAME,
        role: 'appMenu',
        submenu: [
          { label: t('system.app.about', { name: APP_NAME }), role: 'about', visible: !!isMacOS },
          { type: 'separator' },
          { label: t('system.app.hide'), role: 'hide' },
          { label: t('system.app.hideOthers'), role: 'hideOthers' },
          { label: t('system.app.showAll'), role: 'showAll' },
          { type: 'separator' },
          { label: t('system.app.quit', { name: APP_NAME }), role: 'quit' },
        ],
      },
      {
        label: t('system.file.title'),
        role: 'fileMenu',
        submenu: [{ label: t('system.file.closeWindow'), role: 'close' }],
      },
      {
        label: t('system.edit.title'),
        role: 'editMenu',
        submenu: [
          { label: t('system.edit.undo'), role: 'undo' },
          { label: t('system.edit.redo'), role: 'redo' },
          { type: 'separator' },
          { label: t('system.edit.cut'), role: 'cut' },
          { label: t('system.edit.copy'), role: 'copy' },
          { label: t('system.edit.paste'), role: 'paste' },
          { label: t('system.edit.delete'), role: 'delete' },
          { label: t('system.edit.selectAll'), role: 'selectAll' },
        ],
      },
      {
        label: t('system.view.title'),
        role: 'viewMenu',
        submenu: [
          { label: t('system.view.reload'), role: 'reload' },
          { label: t('system.view.forceReload'), role: 'forceReload' },
          { label: t('system.view.toggleDevTools'), role: 'toggleDevTools' },
          { type: 'separator' },
          { label: t('system.view.actualSize'), role: 'resetZoom' },
          { label: t('system.view.zoomIn'), role: 'zoomIn' },
          { label: t('system.view.zoomOut'), role: 'zoomOut' },
          { type: 'separator' },
          { label: t('system.view.toggleFullScreen'), role: 'togglefullscreen' },
        ],
      },
      {
        label: t('system.window.title'),
        role: 'windowMenu',
        submenu: [
          { label: t('system.window.minimize'), role: 'minimize' },
          { label: t('system.window.zoom'), role: 'zoom' },
          // { label: t('system.window.fill'), role: 'front' },
          // { label: t('system.window.center'), role: 'center' },
        ],
      },
    ].filter(Boolean) as MenuItemConstructorOptions[];

    this.contextMenu = Menu.buildFromTemplate(template);
  }

  public updateMenu(showMenu: boolean = false) {
    if (showMenu) {
      this.createMenu();
    } else {
      this.destroyMenu();
    }
  }

  private destroyMenu() {
    if (this.contextMenu) {
      Menu.setApplicationMenu(null);
      this.contextMenu = null;
    }
  }
}
