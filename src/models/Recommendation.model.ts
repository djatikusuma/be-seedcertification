import { Table, Column, Model, DataType, Index, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { BaseEntityInterface } from '../interfaces/model.interface';
import { ProfileApplicant } from './ProfileApplicant.model';

export interface RecommendationInterface extends BaseEntityInterface {
    pemohon_id: string;
    nomor_rekomendasi?: string;
    surat_rekomendasi?: string;
    tanggal_surat_rekomendasi?: Date;
    pemodalan?: number;
    pemeriksa?: string[]; // Array of inspector user IDs
    tenaga_kerja_sd?: number;
    tenaga_kerja_smp?: number;
    tenaga_kerja_sma?: number;
    tenaga_kerja_s1_tani?: number;
    tenaga_kerja_s1_nontani?: number;
    tanggal_verifikasi_dokumen?: Date;
    tanggal_verifikasi_penjadwalan?: Date;
    tanggal_verifikasi_lapangan?: Date;
    tanggal_verifikasi_penerbitan?: Date;
    tanggal_pemeriksaan?: Date;
    is_sertifikasi: boolean;
    status: number;
    catatan_verifikasi?: string;
    catatan_pemeriksaan?: string;
    file_penguasaan_benih?: string;
    link_dokumen_pendukung?: string;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date;
}

export enum RecommendationStatus {
    VERIFIKASI_DOKUMEN = 1,
    PENJADWALAN_PEMERIKSAAN = 2,
    VERIFIKASI_LAPANGAN = 3,
    PENERBITAN_SURAT = 4,
    SELESAI = 5,
    DITOLAK = 6,
}

@Table({
    tableName: 'recommendations',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
})
export class Recommendation extends Model<RecommendationInterface> implements RecommendationInterface {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
        allowNull: false,
    })
    id!: string;

    @Index
    @ForeignKey(() => ProfileApplicant)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    pemohon_id!: string;

    @BelongsTo(() => ProfileApplicant)
    pemohon!: ProfileApplicant;

    @Index
    @Column({
        type: DataType.STRING(100),
        allowNull: true,
    })
    nomor_rekomendasi?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    surat_rekomendasi?: string;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    tanggal_surat_rekomendasi?: Date;

    @Column({
        type: DataType.DECIMAL(15, 2),
        allowNull: true,
    })
    pemodalan?: number;

    @Column({
        type: DataType.JSON,
        allowNull: true,
    })
    pemeriksa?: string[];

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    })
    tenaga_kerja_sd?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    })
    tenaga_kerja_smp?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    })
    tenaga_kerja_sma?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    })
    tenaga_kerja_s1_tani?: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: true,
        defaultValue: 0,
        validate: {
            min: 0,
        },
    })
    tenaga_kerja_s1_nontani?: number;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    tanggal_verifikasi_dokumen?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    tanggal_verifikasi_penjadwalan?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    tanggal_verifikasi_lapangan?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    tanggal_verifikasi_penerbitan?: Date;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    tanggal_pemeriksaan?: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    is_sertifikasi!: boolean;

    @Index
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: [[1, 2, 3, 4, 5, 6]],
        },
    })
    status!: number;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    catatan_verifikasi?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    catatan_pemeriksaan?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    file_penguasaan_benih?: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    link_dokumen_pendukung?: string;

    // Helper method to get status text
    getStatusText(): string {
        const statusMap = {
            1: 'Verifikasi Dokumen',
            2: 'Penjadwalan Pemeriksaan Lapangan',
            3: 'Verifikasi Lapangan',
            4: 'Penerbitan Surat Rekomendasi',
            5: 'Selesai',
            6: 'Ditolak',
        };
        return statusMap[this.status as keyof typeof statusMap] || 'Unknown';
    }
}

export default Recommendation;
