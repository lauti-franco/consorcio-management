"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBuildingDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_building_dto_1 = require("./create-building.dto");
class UpdateBuildingDto extends (0, swagger_1.PartialType)(create_building_dto_1.CreateBuildingDto) {
}
exports.UpdateBuildingDto = UpdateBuildingDto;
//# sourceMappingURL=update-building.dto.js.map