export interface BaseEntityInterface {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserInterface extends BaseEntityInterface {
    name: string;
    email: string;
    emailHash?: string; // Added for encrypted email searching
    password: string;
    roleId: string;
    deletionRequested?: boolean;
    deletionRequestDate?: Date;
    status?: 'active' | 'not_active' | 'revoked';
}

export interface TempUserInterface extends BaseEntityInterface {
    userType: 'perusahaan' | 'petani';
    nik: string;
    nikHash?: string; // Added for encrypted NIK searching
    namaPemohon: string;
    email: string;
    emailHash?: string; // Added for encrypted email searching
    telepon?: string;
    npwp?: string;
    alamatPemohon?: string;
    password: string;
    verificationStatus: 'pending' | 'approved' | 'rejected';
    verificationNotes?: string;
    verifiedBy?: string;
    verifiedAt?: Date;
    deletedAt?: Date;
}

export interface RoleInterface extends BaseEntityInterface {
    roleName: string;
}

export interface MenuInterface extends BaseEntityInterface {
    menuName: string;
    path: string;
    icon: string;
    parentId?: string;
    children?: MenuInterface[];
}

export interface ProfileInterface extends BaseEntityInterface {
    userId: string;
    nip?: string;
    nik: string;
    nikHash?: string; // Added for encrypted NIK searching
    nama: string;
    jabatan?: string;
    telepon?: string;
    alamat?: string;
    golongan?: string;
    pangkat?: string;
    fotoUrl?: string;
}

export interface ProfileApplicantInterface extends BaseEntityInterface {
    userId: string;
    nik: string;
    nikHash?: string; // Added for encrypted NIK searching
    npwp?: string;
    email: string;
    emailHash?: string; // Added for encrypted email searching
    namaPemohon: string;
    telepon?: string;
    alamatPemohon?: string;
    fotoPemohon?: string;
    alamatPerusahaan?: string;
    lokasiPerbenihan?: string;
    nikKuasa?: string;
    namaKuasa?: string;
    fotoKuasa?: string;
    fileAktaPendirian?: string;
    fileKtp?: string;
    fileNpwp?: string;
    fileSuratKuasa?: string;
    statusKepemilikan?: string;
}

export interface RecommendationInterface extends BaseEntityInterface {
    pemohon_id: string;
    seedsource_id?: string;
    verifikator_id?: string;
    inspektur_ketua_id?: string;
    inspektur_id?: string;
    kepala_id?: string;
    nomor_rekomendasi?: string;
    surat_rekomendasi?: string;
    tanggal_surat_rekomendasi?: Date;
    pemodalan?: number;
    pemeriksa?: string[];
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
}

export interface CommodityInterface extends BaseEntityInterface {
    code: string;
    nama: string;
    nama_latin?: string;
    smsb: number;
    smb: number;
    is_active: boolean;
}

export interface CertificationInterface extends BaseEntityInterface {
    id: string;
    pemohon_id: string;
    rekomendasi_id: string;
    komoditas_id: string;
    nomor_registrasi: string;
    nomor_surat_sertifikat?: string;
    tanggal_surat_sertifikat?: Date;
    tanggal_expired_sertifikat?: Date;
    tipe: 'siaptanam' | 'pratanam';
    jumlah_benih: number;
    satuan: string;
    varietas: string;
    status: number;
    catatan_administrasi?: string;
    catatan_pemeriksaan?: string;
    catatan_validasi?: string;
    pemeriksa?: string[];
    tanggal_jadwal_pemeriksaan?: Date;
    tanggal_pemeriksaan?: Date;
    file_surat_sertifikat?: string;
    file_asal_benih?: string;
    file_dokumen_pendukung?: string;
    verifikator_id?: string;
    inspektur_ketua_id?: string;
    inspektur_id?: string;
    kepala_id?: string;
    created_by?: string;
    updated_by?: string;
    profile_applicant?: ProfileApplicantInterface;
    recommendation?: RecommendationInterface;
    commodity?: CommodityInterface;
    verifikator?: UserInterface;
    inspektur_ketua?: UserInterface;
    inspektur?: UserInterface;
    kepala?: UserInterface;
}

export interface CertificationInspectionInterface extends BaseEntityInterface {
    certification_id: string;
    jumlah_benih: number;
    jumlah_diperiksa: number;
    jumlah_lolos: number;
    jumlah_tidak_lolos: number;
    jumlah_belum_lolos: number;
    file_dokumen_hasil_pemeriksaan?: string;
    pemeriksa_id: string;
}

export interface SeedSourceInterface extends BaseEntityInterface {
    pemohon_id: string;
    nomor_penetapan: string;
    tanggal_penetapan: Date;
    file_penetapan_sumber_benih: string;
    status: number;
    verifikator_id?: string;
    catatan_verifikasi?: string;
    verify_at?: Date;
}
