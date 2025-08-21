import { BaseRepository } from './base.repository';
import Menu from '../models/Menu.model';
import { MenuInterface } from '../interfaces/model.interface';

export class MenuRepository extends BaseRepository<Menu> {
    constructor() {
        super(Menu);
    }

    async findByParentId(parentId: string | null): Promise<Menu[]> {
        if (parentId === null) {
            return this.model.findAll({
                where: { parentId: null as any }
            });
        } else {
            return this.model.findAll({
                where: { parentId }
            });
        }
    }
}
