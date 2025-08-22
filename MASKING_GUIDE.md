# Data Masking Utility Documentation

## Overview

Modul `DataMaskingUtil` adalah utility untuk melakukan masking (penyembunyian) data sensitif dengan berbagai metode dan pola. Modul ini mendukung masking untuk email, nomor telepon, kartu kredit, nama, dan pola custom.

## Features

### ✅ Jenis Masking yang Didukung:
- **Email Masking**: `john.doe@example.com` → `jo******@example.com`
- **Phone Masking**: `+628123456789` → `+628*****6789`
- **Credit Card Masking**: `1234567890123456` → `****-****-****-3456`
- **Name Masking**: `John Doe Smith` → `J*** D** S****`
- **Partial Masking**: `sensitive_data` → `sen********ata`
- **Full Masking**: `secret` → `******`
- **Custom Pattern Masking**: Menggunakan regex untuk pola tertentu

### ✅ Fitur Tambahan:
- **Auto Detection**: Otomatis mendeteksi jenis data dan memilih masking yang sesuai
- **Multiple Fields**: Masking beberapa field sekaligus dalam object
- **Configurable Options**: Setiap jenis masking memiliki opsi yang dapat dikustomisasi
- **Role-based Masking**: Masking berbeda berdasarkan role user

## Installation & Usage

### Import Module
```typescript
import { DataMaskingUtil, MaskingType, MaskingOptions } from './utils/masking.util';
```

## Basic Usage Examples

### 1. Email Masking
```typescript
// Default masking
DataMaskingUtil.mask('john.doe@example.com', MaskingType.EMAIL);
// Result: jo******@example.com

// Custom options
DataMaskingUtil.mask('john.doe@example.com', MaskingType.EMAIL, {
    emailVisibleChars: 1,        // Tampilkan 1 karakter di awal
    emailKeepDomain: false,      // Sembunyikan domain
    emailMaskChar: 'X'          // Gunakan 'X' sebagai mask
});
// Result: jXXXXXXXXXXXXXXXXXXX
```

### 2. Phone Number Masking
```typescript
// Default masking
DataMaskingUtil.mask('+628123456789', MaskingType.PHONE);
// Result: +628*****6789

// Custom options
DataMaskingUtil.mask('+628123456789', MaskingType.PHONE, {
    phoneKeepCountryCode: false,  // Sembunyikan kode negara
    phoneKeepLastDigits: 2,       // Tampilkan 2 digit terakhir
    phoneMaskChar: '#'           // Gunakan '#' sebagai mask
});
// Result: #########89
```

### 3. Credit Card Masking
```typescript
// Default masking
DataMaskingUtil.mask('1234567890123456', MaskingType.CREDIT_CARD);
// Result: ****-****-****-3456

// Custom options
DataMaskingUtil.mask('1234567890123456', MaskingType.CREDIT_CARD, {
    cardKeepLastDigits: 6,       // Tampilkan 6 digit terakhir
    cardGroupSeparator: ' ',     // Gunakan spasi sebagai separator
    cardMaskChar: 'X'           // Gunakan 'X' sebagai mask
});
// Result: XXXX XXXX XX12 3456
```

### 4. Name Masking
```typescript
// Default masking
DataMaskingUtil.mask('John Doe Smith', MaskingType.NAME);
// Result: J*** D** S****

// Custom options
DataMaskingUtil.mask('John Doe Smith', MaskingType.NAME, {
    nameKeepFirstChar: true,     // Tampilkan karakter pertama
    nameKeepLastChar: true,      // Tampilkan karakter terakhir
    nameMaskChar: '-'           // Gunakan '-' sebagai mask
});
// Result: J--n D-e S---h
```

### 5. Partial Masking
```typescript
// Default masking
DataMaskingUtil.mask('sensitive_data_123', MaskingType.PARTIAL);
// Result: sen************123

// Custom options
DataMaskingUtil.mask('sensitive_data_123', MaskingType.PARTIAL, {
    visibleStart: 2,            // Tampilkan 2 karakter di awal
    visibleEnd: 2,              // Tampilkan 2 karakter di akhir
    maskChar: '#'              // Gunakan '#' sebagai mask
});
// Result: se##############23
```

### 6. Custom Pattern Masking
```typescript
// Mask semua angka
DataMaskingUtil.mask('ABC-123-DEF-456', MaskingType.CUSTOM, {
    customPattern: /\\d/g,        // Regex untuk angka
    customReplacement: 'X'       // Ganti dengan 'X'
});
// Result: ABC-XXX-DEF-XXX

// Mask semua huruf
DataMaskingUtil.mask('ABC-123-DEF-456', MaskingType.CUSTOM, {
    customPattern: /[A-Z]/g,     // Regex untuk huruf besar
    customReplacement: '*'       // Ganti dengan '*'
});
// Result: ***-123-***-456
```

## Advanced Usage

### 1. Multiple Fields Masking
```typescript
const userData = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+628123456789',
    creditCard: '1234567890123456'
};

const maskedData = DataMaskingUtil.maskFields(userData, {
    name: { type: MaskingType.NAME },
    email: { type: MaskingType.EMAIL },
    phone: { type: MaskingType.PHONE },
    creditCard: { type: MaskingType.CREDIT_CARD }
});

console.log(maskedData);
// Result: {
//     name: 'J*** D**',
//     email: 'jo******@example.com',
//     phone: '+628*****6789',
//     creditCard: '****-****-****-3456'
// }
```

### 2. Auto Detection Masking
```typescript
// Otomatis mendeteksi jenis data
DataMaskingUtil.autoMask('john.doe@example.com');    // Email masking
DataMaskingUtil.autoMask('+628123456789');           // Phone masking
DataMaskingUtil.autoMask('1234567890123456');        // Credit card masking
DataMaskingUtil.autoMask('regular_text');            // Partial masking
```

### 3. Role-based Masking Implementation
```typescript
// Di controller atau service
function getUserData(userId: string, requestingUserRole: string) {
    const user = getUserFromDatabase(userId); // Assume this returns user data
    
    let maskingLevel: 'public' | 'internal' | 'admin';
    
    switch (requestingUserRole) {
        case 'admin':
            maskingLevel = 'admin';
            break;
        case 'manager':
            maskingLevel = 'internal';
            break;
        default:
            maskingLevel = 'public';
            break;
    }
    
    // Apply different masking based on role
    if (maskingLevel === 'admin') {
        // Light masking for admin
        user.email = DataMaskingUtil.mask(user.email, MaskingType.EMAIL, { 
            emailVisibleChars: 5 
        });
    } else if (maskingLevel === 'internal') {
        // Medium masking for internal users
        user.email = DataMaskingUtil.mask(user.email, MaskingType.EMAIL, { 
            emailVisibleChars: 3 
        });
        user.phone = DataMaskingUtil.mask(user.phone, MaskingType.PHONE);
    } else {
        // Heavy masking for public
        user.email = DataMaskingUtil.mask(user.email, MaskingType.EMAIL, { 
            emailVisibleChars: 1 
        });
        user.name = DataMaskingUtil.mask(user.name, MaskingType.NAME);
        user.phone = DataMaskingUtil.mask(user.phone, MaskingType.FULL);
    }
    
    return user;
}
```

## Configuration Options

### Email Masking Options
```typescript
interface EmailOptions {
    emailKeepDomain?: boolean;        // Default: true
    emailMaskChar?: string;           // Default: '*'
    emailVisibleChars?: number;       // Default: 2
}
```

### Phone Masking Options
```typescript
interface PhoneOptions {
    phoneKeepCountryCode?: boolean;   // Default: true
    phoneKeepLastDigits?: number;     // Default: 4
    phoneMaskChar?: string;           // Default: '*'
}
```

### Credit Card Masking Options
```typescript
interface CardOptions {
    cardKeepLastDigits?: number;      // Default: 4
    cardMaskChar?: string;            // Default: '*'
    cardGroupSeparator?: string;      // Default: '-'
}
```

### Name Masking Options
```typescript
interface NameOptions {
    nameKeepFirstChar?: boolean;      // Default: true
    nameKeepLastChar?: boolean;       // Default: false
    nameMaskChar?: string;            // Default: '*'
}
```

### Partial Masking Options
```typescript
interface PartialOptions {
    visibleStart?: number;            // Default: 3
    visibleEnd?: number;              // Default: 3
    maskChar?: string;                // Default: '*'
}
```

## Integration Examples

### 1. Dengan Express.js Middleware
```typescript
import { DataMaskingUtil, MaskingType } from './utils/masking.util';

// Middleware untuk auto-masking response
function autoMaskMiddleware(req: any, res: any, next: any) {
    const userRole = req.user?.role || 'guest';
    const originalJson = res.json;
    
    res.json = function(data: any) {
        if (data && data.data) {
            // Apply masking based on user role
            if (Array.isArray(data.data)) {
                data.data = data.data.map((item: any) => {
                    if (item.email) {
                        item.email = DataMaskingUtil.mask(item.email, MaskingType.EMAIL);
                    }
                    if (item.phone) {
                        item.phone = DataMaskingUtil.mask(item.phone, MaskingType.PHONE);
                    }
                    return item;
                });
            }
        }
        return originalJson.call(this, data);
    };
    
    next();
}
```

### 2. Dengan Sequelize Hooks
```typescript
// Di model User
User.addHook('afterFind', (instances: any) => {
    if (Array.isArray(instances)) {
        instances.forEach(instance => {
            // Apply masking for public API responses
            if (instance.isPublicResponse) {
                instance.email = DataMaskingUtil.mask(instance.email, MaskingType.EMAIL);
                instance.name = DataMaskingUtil.mask(instance.name, MaskingType.NAME);
            }
        });
    } else if (instances && instances.isPublicResponse) {
        instances.email = DataMaskingUtil.mask(instances.email, MaskingType.EMAIL);
        instances.name = DataMaskingUtil.mask(instances.name, MaskingType.NAME);
    }
});
```

## Best Practices

### ✅ Do's:
1. **Gunakan role-based masking** untuk kontrol akses yang granular
2. **Test semua edge cases** seperti string kosong atau data yang terlalu pendek
3. **Dokumentasikan masking rules** untuk setiap field dan role
4. **Konsisten dalam penggunaan** mask character di seluruh aplikasi
5. **Validasi input** sebelum melakukan masking

### ❌ Don'ts:
1. **Jangan mask data** yang diperlukan untuk proses bisnis
2. **Jangan hardcode** masking rules, gunakan konfigurasi
3. **Jangan mask data** di level database, hanya di presentation layer
4. **Jangan lupa** bahwa masking bukan enkripsi - data masih bisa ditebak
5. **Jangan mask** data yang sudah dienkripsi

## Security Notes

⚠️ **Important**: Data masking adalah untuk **presentation layer** dan **bukan untuk security**. Untuk data yang benar-benar sensitif, gunakan **encryption** seperti modul `CryptoUtil` yang sudah ada.

- Masking hanya menyembunyikan sebagian data untuk ditampilkan
- Data asli masih ada di memori dan database
- Untuk keamanan real, gunakan enkripsi + masking
- Selalu validasi permissions sebelum menampilkan data

## Examples dalam Project

Lihat file `masking.examples.ts` untuk contoh implementasi lengkap dalam:
- User model dengan masking
- Controller dengan role-based masking
- Middleware untuk auto-masking
- Integration dengan sistem yang sudah ada

## Testing

Run test untuk memastikan semua fitur bekerja:
```bash
npm run build
node dist/utils/masking.util.test.js
```

Test mencakup semua jenis masking, edge cases, dan konfigurasi options.
