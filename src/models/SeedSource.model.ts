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
import { BaseEntityInterface } from '../interfaces/model.interface';
import { ProfileApplicant } from './ProfileApplicant.model';
import { User } from './User.model';

export interface SeedSourceInterface extends BaseEntityInterface {
    pemohon_id: string;
    nomor_penetapan: string;
    tanggal_penetapan: Date;
    file_penetapan_sumber_benih: string;
    status: number;
    verifikator_id?: string;
    catatan_verifikasi?: string;
    verify_at?: Date;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

export enum SeedSourceStatus {
    VERIFIKASI_DOKUMEN = 1,
    DITERIMA = 2,
    DITOLAK = 3,
}

@Table({
    tableName: 'seed_sources',
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class SeedSource extends Model<SeedSourceInterface> implements SeedSourceInterface {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @ForeignKey(() => ProfileApplicant)
    @AllowNull(false)
    @Column(DataType.UUID)
    pemohon_id!: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    nomor_penetapan!: string;

    @AllowNull(false)
    @Column(DataType.DATE)
    tanggal_penetapan!: Date;

    @AllowNull(false)
    @Column(DataType.TEXT)
    file_penetapan_sumber_benih!: string;

    @Default(SeedSourceStatus.VERIFIKASI_DOKUMEN)
    @AllowNull(false)
    @Column(DataType.INTEGER)
    status!: number;

    @ForeignKey(() => User)
    @AllowNull(true)
    @Column(DataType.UUID)
    verifikator_id?: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    catatan_verifikasi?: string;

    @AllowNull(true)
    @Column(DataType.DATE)
    verify_at?: Date;

    @CreatedAt
    @Column(DataType.DATE)
    declare created_at: Date;

    @UpdatedAt
    @Column(DataType.DATE)
    declare updated_at: Date;

    @DeletedAt
    @Column(DataType.DATE)
    declare deleted_at?: Date;

    // Associations
    @BelongsTo(() => ProfileApplicant)
    pemohon!: ProfileApplicant;

    @BelongsTo(() => User)
    verifikator?: User;

    // Helper methods
    static getStatusLabel(status: number): string {
        switch (status) {
            case SeedSourceStatus.VERIFIKASI_DOKUMEN:
                return 'Verifikasi Dokumen';
            case SeedSourceStatus.DITERIMA:
                return 'Diterima';
            case SeedSourceStatus.DITOLAK:
                return 'Ditolak';
            default:
                return 'Unknown';
        }
    }

    getStatusLabel(): string {
        return SeedSource.getStatusLabel(this.status);
    }

    toJSON(): any {
        const values = Object.assign({}, this.get());
        return {
            ...values,
            status_label: this.getStatusLabel(),
        };
    }
}

export default SeedSource;
