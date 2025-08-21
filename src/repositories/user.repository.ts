import { BaseRepository } from './base.repository';
import User from '../models/User.model';
import { UserInterface } from '../interfaces/model.interface';

export class UserRepository extends BaseRepository<User> {
    constructor() {
        super(User);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.model.findOne({ where: { email } });
    }
}
