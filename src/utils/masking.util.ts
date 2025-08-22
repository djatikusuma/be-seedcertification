/**
 * Data Masking Utility
 * 
 * Provides various data masking techniques for sensitive information
 * including email, phone numbers, credit cards, names, and custom patterns.
 */

export interface MaskingOptions {
    // For email masking
    emailKeepDomain?: boolean;
    emailMaskChar?: string;
    emailVisibleChars?: number;

    // For phone masking
    phoneKeepCountryCode?: boolean;
    phoneKeepLastDigits?: number;
    phoneMaskChar?: string;

    // For credit card masking
    cardKeepLastDigits?: number;
    cardMaskChar?: string;
    cardGroupSeparator?: string;

    // For name masking
    nameKeepFirstChar?: boolean;
    nameKeepLastChar?: boolean;
    nameMaskChar?: string;

    // For custom pattern masking
    customPattern?: RegExp;
    customReplacement?: string;

    // General options
    maskChar?: string;
    visibleStart?: number;
    visibleEnd?: number;
    preserveLength?: boolean;
}

export enum MaskingType {
    EMAIL = 'email',
    PHONE = 'phone',
    CREDIT_CARD = 'credit_card',
    NAME = 'name',
    PARTIAL = 'partial',
    FULL = 'full',
    CUSTOM = 'custom'
}

export class DataMaskingUtil {
    private static readonly DEFAULT_MASK_CHAR = '*';
    private static readonly DEFAULT_EMAIL_VISIBLE_CHARS = 2;
    private static readonly DEFAULT_PHONE_LAST_DIGITS = 4;
    private static readonly DEFAULT_CARD_LAST_DIGITS = 4;

    /**
     * Mask sensitive data based on the specified type and options
     */
    static mask(data: string, type: MaskingType, options: MaskingOptions = {}): string {
        if (!data || data.length === 0) {
            return data;
        }

        switch (type) {
            case MaskingType.EMAIL:
                return this.maskEmail(data, options);
            case MaskingType.PHONE:
                return this.maskPhone(data, options);
            case MaskingType.CREDIT_CARD:
                return this.maskCreditCard(data, options);
            case MaskingType.NAME:
                return this.maskName(data, options);
            case MaskingType.PARTIAL:
                return this.maskPartial(data, options);
            case MaskingType.FULL:
                return this.maskFull(data, options);
            case MaskingType.CUSTOM:
                return this.maskCustom(data, options);
            default:
                return this.maskPartial(data, options);
        }
    }

    /**
     * Mask email addresses
     * Example: john.doe@example.com -> jo****@example.com
     */
    static maskEmail(email: string, options: MaskingOptions = {}): string {
        const {
            emailKeepDomain = true,
            emailMaskChar = this.DEFAULT_MASK_CHAR,
            emailVisibleChars = this.DEFAULT_EMAIL_VISIBLE_CHARS
        } = options;

        const emailRegex = /^([^@]+)(@.+)$/;
        const match = email.match(emailRegex);

        if (!match) {
            return email; // Not a valid email format
        }

        const [, localPart, domain] = match;
        const visibleChars = Math.min(emailVisibleChars, localPart.length - 1);
        const maskedLocal = localPart.substring(0, visibleChars) +
            emailMaskChar.repeat(Math.max(0, localPart.length - visibleChars));

        return emailKeepDomain ? maskedLocal + domain : maskedLocal + emailMaskChar.repeat(domain.length);
    }

    /**
     * Mask phone numbers
     * Example: +1234567890 -> +123***7890
     */
    static maskPhone(phone: string, options: MaskingOptions = {}): string {
        const {
            phoneKeepCountryCode = true,
            phoneKeepLastDigits = this.DEFAULT_PHONE_LAST_DIGITS,
            phoneMaskChar = this.DEFAULT_MASK_CHAR
        } = options;

        // Remove non-digit characters for processing
        const digitsOnly = phone.replace(/\D/g, '');
        const hasCountryCode = phone.startsWith('+');

        if (digitsOnly.length === 0) {
            return phone;
        }

        let result = '';
        let startIndex = 0;

        // Handle country code
        if (hasCountryCode && phoneKeepCountryCode) {
            const countryCodeMatch = phone.match(/^\+(\d{1,3})/);
            if (countryCodeMatch) {
                result += '+' + countryCodeMatch[1];
                startIndex = countryCodeMatch[0].length;
            }
        }

        const remainingPhone = phone.substring(startIndex);
        const remainingDigits = remainingPhone.replace(/\D/g, '');

        if (remainingDigits.length <= phoneKeepLastDigits) {
            return phone; // Too short to mask meaningfully
        }

        const maskLength = remainingDigits.length - phoneKeepLastDigits;
        const lastDigits = remainingDigits.substring(remainingDigits.length - phoneKeepLastDigits);

        result += phoneMaskChar.repeat(maskLength) + lastDigits;

        return result;
    }

    /**
     * Mask credit card numbers
     * Example: 1234567890123456 -> ****-****-****-3456
     */
    static maskCreditCard(cardNumber: string, options: MaskingOptions = {}): string {
        const {
            cardKeepLastDigits = this.DEFAULT_CARD_LAST_DIGITS,
            cardMaskChar = this.DEFAULT_MASK_CHAR,
            cardGroupSeparator = '-'
        } = options;

        const digitsOnly = cardNumber.replace(/\D/g, '');

        if (digitsOnly.length < 8) {
            return cardNumber; // Too short to be a valid card
        }

        const maskLength = digitsOnly.length - cardKeepLastDigits;
        const lastDigits = digitsOnly.substring(digitsOnly.length - cardKeepLastDigits);
        const maskedPortion = cardMaskChar.repeat(maskLength);

        // Group in sets of 4
        const fullMasked = maskedPortion + lastDigits;
        const grouped = fullMasked.match(/.{1,4}/g)?.join(cardGroupSeparator) || fullMasked;

        return grouped;
    }

    /**
     * Mask names
     * Example: John Doe -> J*** D**
     */
    static maskName(name: string, options: MaskingOptions = {}): string {
        const {
            nameKeepFirstChar = true,
            nameKeepLastChar = false,
            nameMaskChar = this.DEFAULT_MASK_CHAR
        } = options;

        return name.split(' ').map(part => {
            if (part.length <= 1) {
                return part;
            }

            let masked = '';

            if (nameKeepFirstChar) {
                masked += part[0];
            }

            const middleLength = part.length - (nameKeepFirstChar ? 1 : 0) - (nameKeepLastChar ? 1 : 0);
            masked += nameMaskChar.repeat(Math.max(0, middleLength));

            if (nameKeepLastChar && part.length > 1) {
                masked += part[part.length - 1];
            }

            return masked;
        }).join(' ');
    }

    /**
     * Partial masking - show start and end characters
     * Example: sensitive123 -> sen*****123
     */
    static maskPartial(data: string, options: MaskingOptions = {}): string {
        const {
            visibleStart = 3,
            visibleEnd = 3,
            maskChar = this.DEFAULT_MASK_CHAR
        } = options;

        if (data.length <= visibleStart + visibleEnd) {
            return data; // Too short to mask meaningfully
        }

        const start = data.substring(0, visibleStart);
        const end = data.substring(data.length - visibleEnd);
        const maskLength = data.length - visibleStart - visibleEnd;

        return start + maskChar.repeat(maskLength) + end;
    }

    /**
     * Full masking - replace entire string with mask characters
     */
    static maskFull(data: string, options: MaskingOptions = {}): string {
        const {
            maskChar = this.DEFAULT_MASK_CHAR,
            preserveLength = true
        } = options;

        if (!preserveLength) {
            return maskChar.repeat(8); // Standard masked length
        }

        return maskChar.repeat(data.length);
    }

    /**
     * Custom pattern masking using regex
     */
    static maskCustom(data: string, options: MaskingOptions = {}): string {
        const {
            customPattern,
            customReplacement = this.DEFAULT_MASK_CHAR.repeat(4)
        } = options;

        if (!customPattern) {
            return this.maskPartial(data, options);
        }

        return data.replace(customPattern, customReplacement);
    }

    /**
     * Mask multiple fields in an object
     */
    static maskFields<T extends Record<string, any>>(
        data: T,
        fieldConfigs: Record<keyof T, { type: MaskingType; options?: MaskingOptions }>
    ): T {
        const masked = { ...data } as any;

        Object.entries(fieldConfigs).forEach(([field, config]) => {
            if (masked[field] && typeof masked[field] === 'string') {
                masked[field] = this.mask(masked[field], config.type, config.options);
            }
        });

        return masked;
    }

    /**
     * Detect and auto-mask common sensitive data patterns
     */
    static autoMask(data: string): string {
        // Email pattern
        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)) {
            return this.maskEmail(data);
        }

        // Phone pattern (basic)
        if (/^\+?[\d\s\-\(\)]{10,}$/.test(data)) {
            return this.maskPhone(data);
        }

        // Credit card pattern (basic)
        if (/^\d{13,19}$/.test(data.replace(/\s/g, ''))) {
            return this.maskCreditCard(data);
        }

        // Default to partial masking
        return this.maskPartial(data);
    }

    /**
     * Unmask data (for testing purposes - not for production use)
     * This is mainly for validation that masking worked correctly
     */
    static isMasked(data: string, maskChar: string = this.DEFAULT_MASK_CHAR): boolean {
        return data.includes(maskChar);
    }
}
