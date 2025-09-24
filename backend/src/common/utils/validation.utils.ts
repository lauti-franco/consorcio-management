import { BadRequestException } from '@nestjs/common';

export class ValidationUtils {
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): void {
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }
  }

  static validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
  }

  static validateFileSize(size: number, maxSize: number): boolean {
    return size <= maxSize;
  }
}