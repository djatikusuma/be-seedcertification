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
import { CertificationInterface } from '../interfaces/model.interface';
import { ProfileApplicant } from './ProfileApplicant.model';
import { Recommendation } from './Recommendation.model';
import { Commodity } from './Commodity.model';

@Table({
    tableName: 'certifications',
    timestamps: true,
    paranoid: true,
    underscored: true,
})
export class Certification extends Model<CertificationInterface> implements CertificationInterface {
    @PrimaryKey
    @Default(DataType.UUIDV4)
    @Column(DataType.UUID)
    declare id: string;

    @AllowNull(false)
    @Column(DataType.STRING(20))
    nomor_registrasi!: string;

    @AllowNull(true)
    @Column(DataType.STRING(50))
    nomor_surat_sertifikat?: string;

    @AllowNull(true)
    @Column(DataType.DATE)
    tanggal_surat_sertifikat?: Date;

    @AllowNull(true)
    @Column(DataType.DATE)
    tanggal_expired_sertifikat?: Date;

    @ForeignKey(() => ProfileApplicant)
    @AllowNull(false)
    @Column(DataType.UUID)
    pemohon_id!: string;

    @ForeignKey(() => Recommendation)
    @AllowNull(false)
    @Column(DataType.UUID)
    rekomendasi_id!: string;

    @ForeignKey(() => Commodity)
    @AllowNull(false)
    @Column(DataType.UUID)
    komoditas_id!: string;

    @AllowNull(false)
    @Column(DataType.ENUM('siaptanam', 'pratanam'))
    tipe!: 'siaptanam' | 'pratanam';

    @AllowNull(false)
    @Column(DataType.DECIMAL(15, 2))
    jumlah_benih!: number;

    @AllowNull(false)
    @Column(DataType.STRING(20))
    satuan!: string;

    @AllowNull(false)
    @Column(DataType.STRING(100))
    varietas!: string;

    @AllowNull(false)
    @Default(1)
    @Column(DataType.INTEGER)
    status!: number;

    @AllowNull(true)
    @Column(DataType.TEXT)
    catatan_administrasi?: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    catatan_pemeriksaan?: string;

    @AllowNull(true)
    @Column(DataType.TEXT)
    catatan_validasi?: string;

    @AllowNull(true)
    @Column(DataType.JSON)
    pemeriksa?: string[];

    @AllowNull(true)
    @Column(DataType.DATE)
    tanggal_jadwal_pemeriksaan?: Date;

    @AllowNull(true)
    @Column(DataType.DATE)
    tanggal_pemeriksaan?: Date;

    @AllowNull(true)
    @Column(DataType.STRING(255))
    file_surat_sertifikat?: string;

    @AllowNull(true)
    @Column(DataType.STRING(255))
    file_asal_benih?: string;

    @AllowNull(true)
    @Column(DataType.STRING(255))
    file_dokumen_pendukung?: string;

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
    @BelongsTo(() => ProfileApplicant)
    pemohon!: ProfileApplicant;

    @BelongsTo(() => Recommendation)
    rekomendasi!: Recommendation;

    @BelongsTo(() => Commodity)
    komoditas!: Commodity;

    /**
     * Generate registration number based on type
     */
    static generateRegistrationNumber(type: 'siaptanam' | 'pratanam', sequence: number): string {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, '0');
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const year = String(now.getFullYear()).slice(-2);
        const typeCode = type === 'pratanam' ? 'PT' : 'ST';
        const seqNumber = String(sequence).padStart(4, '0');

        return `REG-${typeCode}${day}${month}${year}${seqNumber}`;
    }

    /**
     * Get status label
     */
    getStatusLabel(): string {
        const statusLabels: { [key: number]: string } = {
            1: 'Verifikasi Dokumen',
            2: 'Penjadwalan Pemeriksaan Lapangan',
            3: 'Verifikasi Lapangan',
            4: 'Pengesahan Pemeriksaan',
            5: 'Penerbitan Surat Rekomendasi',
            6: 'Selesai',
            7: 'Ditolak',
        };
        return statusLabels[this.status] || 'Status Tidak Dikenal';
    }
}

export default Certification;
