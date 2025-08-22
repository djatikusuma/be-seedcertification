/**
 * Test file for DataMaskingUtil
 * Run with: npm run test or node -r ts-node/register src/utils/masking.util.test.ts
 */

import { DataMaskingUtil, MaskingType, MaskingOptions } from './masking.util';

console.log('🔐 Testing Data Masking Utility');
console.log('================================\n');

// Test Email Masking
console.log('📧 Email Masking Tests:');
console.log('Original: john.doe@example.com');
console.log('Default mask:', DataMaskingUtil.mask('john.doe@example.com', MaskingType.EMAIL));
console.log('Keep domain false:', DataMaskingUtil.mask('john.doe@example.com', MaskingType.EMAIL, { emailKeepDomain: false }));
console.log('Visible chars 1:', DataMaskingUtil.mask('john.doe@example.com', MaskingType.EMAIL, { emailVisibleChars: 1 }));
console.log('Custom mask char:', DataMaskingUtil.mask('john.doe@example.com', MaskingType.EMAIL, { emailMaskChar: 'X' }));
console.log();

// Test Phone Masking
console.log('📱 Phone Masking Tests:');
console.log('Original: +628123456789');
console.log('Default mask:', DataMaskingUtil.mask('+628123456789', MaskingType.PHONE));
console.log('Keep country code false:', DataMaskingUtil.mask('+628123456789', MaskingType.PHONE, { phoneKeepCountryCode: false }));
console.log('Keep last 2 digits:', DataMaskingUtil.mask('+628123456789', MaskingType.PHONE, { phoneKeepLastDigits: 2 }));
console.log('Local number:', DataMaskingUtil.mask('08123456789', MaskingType.PHONE));
console.log();

// Test Credit Card Masking
console.log('💳 Credit Card Masking Tests:');
console.log('Original: 1234567890123456');
console.log('Default mask:', DataMaskingUtil.mask('1234567890123456', MaskingType.CREDIT_CARD));
console.log('Keep last 6 digits:', DataMaskingUtil.mask('1234567890123456', MaskingType.CREDIT_CARD, { cardKeepLastDigits: 6 }));
console.log('Custom separator:', DataMaskingUtil.mask('1234567890123456', MaskingType.CREDIT_CARD, { cardGroupSeparator: ' ' }));
console.log('With spaces: 1234 5678 9012 3456');
console.log('Masked:', DataMaskingUtil.mask('1234 5678 9012 3456', MaskingType.CREDIT_CARD));
console.log();

// Test Name Masking
console.log('👤 Name Masking Tests:');
console.log('Original: John Doe Smith');
console.log('Default mask:', DataMaskingUtil.mask('John Doe Smith', MaskingType.NAME));
console.log('Keep first and last:', DataMaskingUtil.mask('John Doe Smith', MaskingType.NAME, { nameKeepLastChar: true }));
console.log('No first char:', DataMaskingUtil.mask('John Doe Smith', MaskingType.NAME, { nameKeepFirstChar: false }));
console.log();

// Test Partial Masking
console.log('🔍 Partial Masking Tests:');
console.log('Original: sensitive_data_123');
console.log('Default partial:', DataMaskingUtil.mask('sensitive_data_123', MaskingType.PARTIAL));
console.log('Start 2, End 2:', DataMaskingUtil.mask('sensitive_data_123', MaskingType.PARTIAL, { visibleStart: 2, visibleEnd: 2 }));
console.log('Start 5, End 5:', DataMaskingUtil.mask('sensitive_data_123', MaskingType.PARTIAL, { visibleStart: 5, visibleEnd: 5 }));
console.log();

// Test Full Masking
console.log('🚫 Full Masking Tests:');
console.log('Original: VerySecretPassword');
console.log('Preserve length:', DataMaskingUtil.mask('VerySecretPassword', MaskingType.FULL));
console.log('Standard length:', DataMaskingUtil.mask('VerySecretPassword', MaskingType.FULL, { preserveLength: false }));
console.log();

// Test Custom Masking
console.log('⚙️ Custom Masking Tests:');
console.log('Original: ABC-123-DEF-456');
console.log('Mask numbers:', DataMaskingUtil.mask('ABC-123-DEF-456', MaskingType.CUSTOM, {
    customPattern: /\d/g,
    customReplacement: 'X'
}));
console.log('Mask letters:', DataMaskingUtil.mask('ABC-123-DEF-456', MaskingType.CUSTOM, {
    customPattern: /[A-Z]/g,
    customReplacement: '*'
}));
console.log();

// Test Multiple Fields
console.log('🗂️ Multiple Fields Masking Test:');
const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+628123456789',
    creditCard: '1234567890123456',
    ssn: '123-45-6789'
};

console.log('Original data:', JSON.stringify(userData, null, 2));

const maskedUserData = DataMaskingUtil.maskFields(userData, {
    name: { type: MaskingType.NAME },
    email: { type: MaskingType.EMAIL },
    phone: { type: MaskingType.PHONE },
    creditCard: { type: MaskingType.CREDIT_CARD },
    ssn: { type: MaskingType.PARTIAL, options: { visibleStart: 0, visibleEnd: 4 } }
});

console.log('Masked data:', JSON.stringify(maskedUserData, null, 2));
console.log();

// Test Auto Masking
console.log('🤖 Auto Masking Tests:');
const testData = [
    'john.doe@example.com',
    '+628123456789',
    '1234567890123456',
    'regular_text_data'
];

testData.forEach(data => {
    console.log(`Original: ${data} -> Auto masked: ${DataMaskingUtil.autoMask(data)}`);
});
console.log();

// Test Edge Cases
console.log('⚠️ Edge Cases Tests:');
console.log('Empty string:', `"${DataMaskingUtil.mask('', MaskingType.EMAIL)}"`);
console.log('Short email:', DataMaskingUtil.mask('a@b.c', MaskingType.EMAIL));
console.log('Short phone:', DataMaskingUtil.mask('123', MaskingType.PHONE));
console.log('Short card:', DataMaskingUtil.mask('1234', MaskingType.CREDIT_CARD));
console.log('Single name:', DataMaskingUtil.mask('John', MaskingType.NAME));
console.log();

console.log('✅ All masking tests completed!');

export { }; // Make this a module
