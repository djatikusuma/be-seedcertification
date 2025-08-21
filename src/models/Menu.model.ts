import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { MenuInterface } from '../interfaces/model.interface';

@Table({
    tableName: 'menus',
    timestamps: true,
})
export class Menu extends Model<MenuInterface> implements MenuInterface {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    menuName!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    path!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        defaultValue: 'menu-icon', // Default icon
    })
    icon!: string;

    @ForeignKey(() => Menu)
    @Column({
        type: DataType.UUID,
        allowNull: true,
    })
    parentId?: string;

    @BelongsTo(() => Menu, 'parentId')
    parentMenu?: Menu;
}

export default Menu;
