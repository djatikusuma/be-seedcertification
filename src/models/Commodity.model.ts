import { Table, Column, Model, DataType, Index } from 'sequelize-typescript';
import { BaseEntityInterface } from '../interfaces/model.interface';

export interface CommodityInterface extends BaseEntityInterface {
    code: string;
    nama: string;
    nama_latin?: string;
    smsb: number;
    smb: number;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

@Table({
    tableName: 'commodities',
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class Commodity extends Model<CommodityInterface> implements CommodityInterface {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        allowNull: false,
    })
    id!: string;

    @Index
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: {
                msg: 'Code cannot be empty',
            },
            len: {
                args: [1, 50],
                msg: 'Code must be between 1 and 50 characters',
            },
        },
    })
    code!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'Nama cannot be empty',
            },
            len: {
                args: [1, 255],
                msg: 'Nama must be between 1 and 255 characters',
            },
        },
    })
    nama!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
        validate: {
            len: {
                args: [0, 255],
                msg: 'Nama latin must be less than 255 characters',
            },
        },
    })
    nama_latin?: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: {
                msg: 'SMSB must be an integer',
            },
            min: {
                args: [0],
                msg: 'SMSB must be greater than or equal to 0',
            },
        },
    })
    smsb!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isInt: {
                msg: 'SMB must be an integer',
            },
            min: {
                args: [0],
                msg: 'SMB must be greater than or equal to 0',
            },
        },
    })
    smb!: number;

    @Index
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    is_active!: boolean;
}

export default Commodity;
