import { Controller, Get, Param } from '@nestjs/common';
import { TenantService } from './tenant.service';

@Controller('tenants')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tenantService.validateTenant(id);
  }
}
