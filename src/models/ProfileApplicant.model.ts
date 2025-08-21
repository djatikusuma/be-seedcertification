import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { ProfileApplicantInterface } from '../interfaces/model.interface';
import { User } from './User.model';

@Table({
    tableName: 'profile_applicants',
    timestamps: true,
})
export class ProfileApplicant extends Model<ProfileApplicantInterface> implements ProfileApplicantInterface {
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
        allowNull: false,
    })
    nik!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    npwp?: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    namaPemohon!: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    telepon?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    alamatPemohon?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fotoPemohon?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    alamatPerusahaan?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    lokasiPerbenihan?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    nikKuasa?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    namaKuasa?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fotoKuasa?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileAktaPendirian?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileKtp?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileNpwp?: string;

    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    fileSuratKuasa?: string;

    @Column({
        type: DataType.ENUM('Milik Sendiri', 'Sewa', 'Bagi Hasil'),
        allowNull: true,
    })
    statusKepemilikan?: string;
}

export default ProfileApplicant;
