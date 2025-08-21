import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { RoleInterface } from '../interfaces/model.interface';
import { User } from './User.model';

@Table({
    tableName: 'roles',
    timestamps: true,
})
export class Role extends Model<RoleInterface> implements RoleInterface {
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
    roleName!: string;

    @HasMany(() => User)
    users?: User[];
}

export default Role;
