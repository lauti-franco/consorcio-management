"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskStatus = exports.TicketStatus = exports.ExpenseStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MAINTENANCE"] = "MAINTENANCE";
    UserRole["RESIDENT"] = "RESIDENT";
})(UserRole || (exports.UserRole = UserRole = {}));
var ExpenseStatus;
(function (ExpenseStatus) {
    ExpenseStatus["OPEN"] = "OPEN";
    ExpenseStatus["PAID"] = "PAID";
    ExpenseStatus["OVERDUE"] = "OVERDUE";
})(ExpenseStatus || (exports.ExpenseStatus = ExpenseStatus = {}));
var TicketStatus;
(function (TicketStatus) {
    TicketStatus["OPEN"] = "OPEN";
    TicketStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TicketStatus["RESOLVED"] = "RESOLVED";
})(TicketStatus || (exports.TicketStatus = TicketStatus = {}));
var TaskStatus;
(function (TaskStatus) {
    TaskStatus["PENDING"] = "PENDING";
    TaskStatus["IN_PROGRESS"] = "IN_PROGRESS";
    TaskStatus["COMPLETED"] = "COMPLETED";
    TaskStatus["CANCELLED"] = "CANCELLED";
})(TaskStatus || (exports.TaskStatus = TaskStatus = {}));
//# sourceMappingURL=index.js.map