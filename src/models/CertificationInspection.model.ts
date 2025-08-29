import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    Default,
    AllowNull,
    CreatedAt,
    UpdatedAt,
    DeletedAt,
    BelongsTo,
    ForeignKey,
} from 'sequelize-typescript';
import { CertificationInspectionInterface } from '../interfaces/model.interface';
import { Certification } from './Certification.model';
import { User } from './User.model';

@Table({
    tableName: 'certification_inspections',
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class CertificationInspection extends Model<CertificationInspectionInterface> implements CertificationInspectionInterface {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => Certification)
    @AllowNull(false)
    @Column(DataType.UUID)
    certification_id!: string;

    @AllowNull(false)
    @Column(DataType.DECIMAL(15, 2))
    jumlah_benih!: number;

    @AllowNull(false)
    @Column(DataType.DECIMAL(15, 2))
    jumlah_diperiksa!: number;

    @AllowNull(false)
    @Column(DataType.DECIMAL(15, 2))
    jumlah_lolos!: number;

    @AllowNull(false)
    @Column(DataType.DECIMAL(15, 2))
    jumlah_tidak_lolos!: number;

    @AllowNull(false)
    @Column(DataType.DECIMAL(15, 2))
    jumlah_belum_lolos!: number;

    @AllowNull(true)
    @Column(DataType.DECIMAL(5, 2))
    persentase_kemurnian?: number;

    @AllowNull(true)
    @Column(DataType.DECIMAL(5, 2))
    kadar_air?: number;

    @AllowNull(true)
    @Column(DataType.DECIMAL(5, 2))
    daya_berkecambah?: number;

    @AllowNull(true)
    @Column(DataType.TEXT)
    catatan?: string;

    @AllowNull(false)
    @Default('pending')
    @Column(DataType.ENUM('lolos', 'tidak_lolos', 'pending'))
    status_pemeriksaan!: 'lolos' | 'tidak_lolos' | 'pending';

    @AllowNull(true)
    @Column(DataType.STRING(255))
    file_dokumen_hasil_pemeriksaan?: string;

    @ForeignKey(() => User)
    @AllowNull(false)
    @Column(DataType.UUID)
    pemeriksa_id!: string;

    @CreatedAt
    @Column(DataType.DATE)
    declare createdAt: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    declare updatedAt: Date;

    @DeletedAt
    @Column(DataType.DATE)
    declare deletedAt?: Date;

    // Associations
    @BelongsTo(() => Certification)
    certification!: Certification;

    @BelongsTo(() => User)
    pemeriksa!: User;
}

export default CertificationInspection;
