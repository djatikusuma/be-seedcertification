import { MenuInterface } from '../interfaces/model.interface';
import { MenuRepository } from '../repositories/menu.repository';
import { BaseService } from './base.service';

export class MenuService extends BaseService<MenuInterface> {
    private menuRepository: MenuRepository;

    constructor() {
        const repository = new MenuRepository();
        super(repository);
        this.menuRepository = repository;
    }

    async findByParentId(parentId: string | null): Promise<MenuInterface[]> {
        return this.menuRepository.findByParentId(parentId);
    }

    /**
     * Get the complete menu tree with multiple levels of nesting
     * @returns A hierarchical tree of menu items with parent-child relationships
     */
    async getMenuTree(): Promise<MenuInterface[]> {
        // Get top-level menus (those without a parentId)
        const topLevelMenus = await this.menuRepository.findByParentId(null);

        // Convert to plain objects and build the tree
        const menuTree = topLevelMenus.map(menu => menu.get({ plain: true })) as MenuInterface[];

        // Build the full tree structure
        for (const menu of menuTree) {
            await this.buildMenuTree(menu);
        }

        return menuTree;
    }

    /**
     * Recursively build the menu tree by attaching children to each menu
     * @param menuItem The parent menu to build children for
     */
    private async buildMenuTree(menuItem: MenuInterface): Promise<void> {
        // Find all children for this menu
        const childMenus = await this.menuRepository.findByParentId(menuItem.id);

        if (childMenus.length === 0) {
            // No children found, set empty array
            menuItem.children = [];
            return;
        }

        // Convert children to plain objects
        menuItem.children = childMenus.map(child => child.get({ plain: true })) as MenuInterface[];

        // Recursively process each child
        for (const childMenu of menuItem.children) {
            await this.buildMenuTree(childMenu);
        }
    }
}
