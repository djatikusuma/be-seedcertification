import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ProfileInterface } from '../interfaces/model.interface';
import { User } from './User.model';

@Table({
    tableName: 'profiles',
    timestamps: true,
})
export class Profile extends Model<ProfileInterface> implements ProfileInterface {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @ForeignKey(() => User)
    @Column({
        type: DataType.UUID,
        allowNull: false,
        unique: true,
    })
    userId!: string;

    @BelongsTo(() => User)
    user?: User;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    nip?: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    nik!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    nama!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    jabatan?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    telepon?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    alamat?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    golongan?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    pangkat?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fotoUrl?: string;
}

export default Profile;
