"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationUtils = void 0;
const common_1 = require("@nestjs/common");
class ValidationUtils {
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    static validatePassword(password) {
        if (password.length < 6) {
            throw new common_1.BadRequestException('Password must be at least 6 characters long');
        }
    }
    static validateFileType(mimeType, allowedTypes) {
        return allowedTypes.includes(mimeType);
    }
    static validateFileSize(size, maxSize) {
        return size <= maxSize;
    }
}
exports.ValidationUtils = ValidationUtils;
//# sourceMappingURL=validation.utils.js.map