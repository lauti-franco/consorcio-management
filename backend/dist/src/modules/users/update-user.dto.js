"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUserDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const register_dto_1 = require("../auth/dto/register.dto");
class UpdateUserDto extends (0, swagger_1.PartialType)(register_dto_1.RegisterDto) {
}
exports.UpdateUserDto = UpdateUserDto;
//# sourceMappingURL=update-user.dto.js.map