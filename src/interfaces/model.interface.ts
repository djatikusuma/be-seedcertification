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
