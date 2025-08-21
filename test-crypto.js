const { CryptoUtil } = require('./dist/utils/crypto.util.js');

console.log('=== AES-256 Encryption Module Test ===\n');

// Test basic encryption
const originalText = 'Hello, this is a test message!';
console.log('Original text:', originalText);

try {
    const encrypted = CryptoUtil.encrypt(originalText);
    console.log('Encrypted successfully!');
    console.log('Encrypted data:', encrypted);

    const decrypted = CryptoUtil.decrypt(encrypted);
    console.log('Decrypted text:', decrypted);
    console.log('Test result:', originalText === decrypted ? '✅ SUCCESS' : '❌ FAILED');

    // Test object encryption
    const testObject = { name: 'John', age: 30, secret: 'classified' };
    const encryptedObj = CryptoUtil.encryptObject(testObject);
    console.log('\nObject encrypted successfully!');

    const decryptedObj = CryptoUtil.decryptToObject(encryptedObj);
    console.log('Decrypted object:', decryptedObj);

    // Test token generation
    const token = CryptoUtil.generateToken();
    console.log('\nGenerated token:', token);

    console.log('\n✅ All basic tests passed!');
} catch (error) {
    console.error('❌ Test failed:', error.message);
}
