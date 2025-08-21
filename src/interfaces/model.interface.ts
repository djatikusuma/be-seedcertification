export interface BaseEntityInterface {
    id: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface UserInterface extends BaseEntityInterface {
    name: string;
    email: string;
    password: string;
    roleId: string;
    deletionRequested?: boolean;
    deletionRequestDate?: Date;
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
    npwp?: string;
    email: string;
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
