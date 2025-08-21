import { Table, Column, Model, DataType } from 'sequelize-typescript';
import { SettingsInterface } from '../interfaces/settings.interface';

@Table({
    tableName: 'settings',
    timestamps: true,
})
export class Settings extends Model<SettingsInterface> implements SettingsInterface {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    key!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: false,
    })
    value!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    description?: string;
}

export default Settings;
