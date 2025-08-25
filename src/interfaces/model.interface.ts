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
