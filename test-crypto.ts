import CryptoUtil, { EncryptionResult, DecryptionInput } from '../src/utils/crypto.util';

// Test basic string encryption and decryption
console.log('=== AES-256 Encryption/Decryption Module Test ===\n');

// Test 1: Basic string encryption and decryption
console.log('1. Basic String Encryption/Decryption Test:');
const originalText = 'This is a sensitive information that needs to be encrypted!';
console.log('Original:', originalText);

const encrypted = CryptoUtil.encrypt(originalText);
console.log('Encrypted Data:', encrypted);

const decrypted = CryptoUtil.decrypt(encrypted);
console.log('Decrypted:', decrypted);
console.log('Match:', originalText === decrypted ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test 2: Object encryption and decryption
console.log('2. Object Encryption/Decryption Test:');
const originalObject = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: {
        street: '123 Main St',
        city: 'Jakarta',
        country: 'Indonesia'
    },
    sensitiveData: 'This is very sensitive information'
};
console.log('Original Object:', JSON.stringify(originalObject, null, 2));

const encryptedObject = CryptoUtil.encryptObject(originalObject);
console.log('Encrypted Object Data:', encryptedObject);

const decryptedObject = CryptoUtil.decryptToObject(encryptedObject);
console.log('Decrypted Object:', JSON.stringify(decryptedObject, null, 2));
console.log('Match:', JSON.stringify(originalObject) === JSON.stringify(decryptedObject) ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test 3: Custom password encryption
console.log('3. Custom Password Encryption Test:');
const customPassword = 'my-super-secret-password-123';
const textWithCustomPassword = 'Data encrypted with custom password';
console.log('Original:', textWithCustomPassword);

const encryptedWithCustom = CryptoUtil.encrypt(textWithCustomPassword, customPassword);
console.log('Encrypted with custom password:', encryptedWithCustom);

const decryptedWithCustom = CryptoUtil.decrypt(encryptedWithCustom, customPassword);
console.log('Decrypted with custom password:', decryptedWithCustom);
console.log('Match:', textWithCustomPassword === decryptedWithCustom ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test 4: Hash and HMAC functions
console.log('4. Hash and HMAC Test:');
const dataToHash = 'important data to hash';
const hash1 = CryptoUtil.hash(dataToHash);
const hash2 = CryptoUtil.hash(dataToHash);
console.log('Original data:', dataToHash);
console.log('Hash 1:', hash1);
console.log('Hash 2:', hash2);
console.log('Hashes match:', hash1 === hash2 ? '✅ PASS' : '❌ FAIL');

const hmac1 = CryptoUtil.hmac(dataToHash);
const hmac2 = CryptoUtil.hmac(dataToHash, 'custom-secret');
console.log('HMAC with default secret:', hmac1);
console.log('HMAC with custom secret:', hmac2);
console.log('HMACs different (as expected):', hmac1 !== hmac2 ? '✅ PASS' : '❌ FAIL');

const hashMatch = CryptoUtil.compareHash(dataToHash, hash1);
console.log('Hash comparison:', hashMatch ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test 5: Field encryption utility (for database models)
console.log('5. Database Field Encryption Test:');
const userData = {
    id: 1,
    username: 'johndoe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main Street, Jakarta',
    socialSecurityNumber: '123-45-6789',
    creditCardNumber: '4532-1234-5678-9012'
};

const fieldsToEncrypt = ['phone', 'address', 'socialSecurityNumber', 'creditCardNumber'];
console.log('Original user data:', JSON.stringify(userData, null, 2));

const encryptedUserData = CryptoUtil.encryptFields(userData, fieldsToEncrypt);
console.log('Encrypted user data:', JSON.stringify(encryptedUserData, null, 2));

const decryptedUserData = CryptoUtil.decryptFields(encryptedUserData, fieldsToEncrypt);
console.log('Decrypted user data:', JSON.stringify(decryptedUserData, null, 2));

const fieldsMatch = fieldsToEncrypt.every(field => userData[field] === decryptedUserData[field]);
console.log('Encrypted fields match after decryption:', fieldsMatch ? '✅ PASS' : '❌ FAIL');
console.log('---\n');

// Test 6: Token generation
console.log('6. Token Generation Test:');
const token1 = CryptoUtil.generateToken();
const token2 = CryptoUtil.generateToken();
const customLengthToken = CryptoUtil.generateToken(16);
console.log('Token 1:', token1);
console.log('Token 2:', token2);
console.log('Custom length token (16 bytes):', customLengthToken);
console.log('Tokens are different:', token1 !== token2 ? '✅ PASS' : '❌ FAIL');
console.log('Custom token length correct:', customLengthToken.length === 32 ? '✅ PASS' : '❌ FAIL'); // 16 bytes = 32 hex chars
console.log('---\n');

// Test 7: Key and IV generation
console.log('7. Key and IV Generation Test:');
const generatedKey = CryptoUtil.generateKey();
const generatedSalt = CryptoUtil.generateSalt();
const generatedIV = CryptoUtil.generateIV();
console.log('Generated Key (32 bytes):', generatedKey);
console.log('Generated Salt (16 bytes):', generatedSalt);
console.log('Generated IV (16 bytes):', generatedIV);
console.log('Key length correct:', generatedKey.length === 64 ? '✅ PASS' : '❌ FAIL'); // 32 bytes = 64 hex chars
console.log('Salt length correct:', generatedSalt.length === 32 ? '✅ PASS' : '❌ FAIL'); // 16 bytes = 32 hex chars
console.log('IV length correct:', generatedIV.length === 32 ? '✅ PASS' : '❌ FAIL'); // 16 bytes = 32 hex chars
console.log('---\n');

// Test 8: Error handling
console.log('8. Error Handling Test:');
try {
    CryptoUtil.encrypt('');
    console.log('Empty string encryption: ❌ FAIL (should throw error)');
} catch (error) {
    console.log('Empty string encryption: ✅ PASS (correctly threw error)');
}

try {
    CryptoUtil.decrypt({ encrypted: '', iv: '', salt: '' });
    console.log('Invalid decryption data: ❌ FAIL (should throw error)');
} catch (error) {
    console.log('Invalid decryption data: ✅ PASS (correctly threw error)');
}

try {
    CryptoUtil.decrypt(encrypted, 'wrong-password');
    console.log('Wrong password decryption: ❌ FAIL (should throw error)');
} catch (error) {
    console.log('Wrong password decryption: ✅ PASS (correctly threw error)');
}

console.log('\n=== All Tests Completed ===');
