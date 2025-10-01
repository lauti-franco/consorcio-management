import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../shared/database/prisma.service';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}

  async validateTenant(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
    });
  }

  async getTenantBySubdomain(subdomain: string) {
    // Buscar por cualquier campo que exista en el schema
    return this.prisma.tenant.findFirst({
      where: { 
        OR: [
          { id: subdomain },
          { name: { contains: subdomain, mode: 'insensitive' } }
        ]
      },
    });
  }

  async getTenantById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id: id },
    });
  }

  async getAllTenants() {
    return this.prisma.tenant.findMany();
  }
}
