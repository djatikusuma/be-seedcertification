import { Table, Column, Model, DataType, BelongsTo, ForeignKey, HasOne } from 'sequelize-typescript';
import { UserInterface } from '../interfaces/model.interface';
import Role from './Role.model';

@Table({
    tableName: 'users',
    timestamps: true,
})
export class User extends Model<UserInterface> implements UserInterface {
    @Column({
        type: DataType.UUID,
        defaultValue: DataType.UUIDV4,
        primaryKey: true,
    })
    id!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    name!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
        unique: true,
    })
    email!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    password!: string;

    @ForeignKey(() => Role)
    @Column({
        type: DataType.UUID,
        allowNull: false,
    })
    roleId!: string;

    @BelongsTo(() => Role)
    role?: Role;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    })
    deletionRequested!: boolean;

    @Column({
        type: DataType.DATE,
        allowNull: true,
    })
    deletionRequestDate?: Date;

    // Lazy loading for profile relationships
    @HasOne(() => require('./Profile.model').Profile)
    profile?: any;

    @HasOne(() => require('./ProfileApplicant.model').ProfileApplicant)
    profileApplicant?: any;
}

export default User;
