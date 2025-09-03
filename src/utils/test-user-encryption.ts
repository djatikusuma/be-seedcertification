#!/usr/bin/env ts-node
/**
 * Test script to check and fix user encryption
 * Run with: npx ts-node src/utils/test-user-encryption.ts
 */

import { sequelize } from '../config/sequelize';
import User from '../models/User.model';
import { CryptoUtil } from './crypto.util';

async function checkUserEncryption() {
    try {
        console.log('🔍 Checking user encryption status...\n');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Get all users without hooks to see raw data
        const users = await User.findAll({
            attributes: ['id', 'name', 'email', 'emailHash'],
            limit: 10 // Limit for testing
        });

        console.log(`\n📊 Found ${users.length} users to check:\n`);

        for (const user of users) {
            console.log(`👤 User ID: ${user.id}`);

            // Check name encryption
            const name = (user as any).name;
            const email = (user as any).email;

            console.log(`   Name: ${name ? (name.length > 50 ? 'ENCRYPTED ✅' : 'PLAIN TEXT ❌') : 'NULL'}`);
            console.log(`   Email: ${email ? (email.length > 50 ? 'ENCRYPTED ✅' : 'PLAIN TEXT ❌') : 'NULL'}`);
            console.log(`   Email Hash: ${(user as any).emailHash ? 'EXISTS ✅' : 'MISSING ❌'}`);

            // Try to decrypt name if it looks encrypted
            if (name && name.length > 50) {
                try {
                    const decryptedName = CryptoUtil.decrypt(name);
                    console.log(`   Decrypted Name: ${decryptedName} ✅`);
                } catch (error) {
                    console.log(`   Decrypt Name Failed: ${error} ❌`);
                }
            }

            // Try to decrypt email if it looks encrypted
            if (email && email.length > 50) {
                try {
                    const decryptedEmail = CryptoUtil.decrypt(email);
                    console.log(`   Decrypted Email: ${decryptedEmail} ✅`);
                } catch (error) {
                    console.log(`   Decrypt Email Failed: ${error} ❌`);
                }
            }

            console.log('   ---');
        }

        console.log('\n🔧 To fix unencrypted users, run: User.encryptExistingData()');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
        console.log('\n🔒 Database connection closed');
    }
}

async function encryptExistingUsers() {
    try {
        console.log('🔧 Starting user encryption fix...\n');

        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Database connected successfully');

        // Run encryption fix
        const result = await User.encryptExistingData();

        console.log('\n📊 Encryption Results:');
        console.log(`   Processed: ${result.processed} users`);
        console.log(`   Errors: ${result.errors} users`);

        if (result.processed > 0) {
            console.log('✅ Encryption completed successfully!');
        } else {
            console.log('ℹ️  No users needed encryption');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
        console.log('\n🔒 Database connection closed');
    }
}

// Command line interface
const command = process.argv[2];

if (command === 'check') {
    checkUserEncryption();
} else if (command === 'fix') {
    encryptExistingUsers();
} else {
    console.log('📖 Usage:');
    console.log('  npx ts-node src/utils/test-user-encryption.ts check  # Check encryption status');
    console.log('  npx ts-node src/utils/test-user-encryption.ts fix    # Fix unencrypted data');
}
