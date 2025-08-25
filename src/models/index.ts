import { User } from './User.model';
import { Role } from './Role.model';
import { Menu } from './Menu.model';
import { Profile } from './Profile.model';
import { ProfileApplicant } from './ProfileApplicant.model';
import { TempUser } from './TempUser.model';
import sequelize from '../config/sequelize';

// Models will be initialized when imported by sequelize
const initializeAssociations = () => {
    // Make sure models are properly initialized before defining associations
    const models = sequelize.models;

    // Now define associations safely
    // These are in addition to the decorators in the model files
    // which will be applied when models are initialized
};

// Initialize associations after Sequelize has loaded all models
initializeAssociations();

export { User, Role, Menu, Profile, ProfileApplicant };
export default { User, Role, Menu, Profile, ProfileApplicant };
