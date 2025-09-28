class Expense {
  final String id;
  final String concept;
  final double amount;
  final DateTime dueDate;
  final String? period; // ← NUEVO: período (ej: "2024-01")
  final String type; // ← NUEVO: ORDINARY, EXTRAORDINARY, etc.
  final String status;
  final String buildingId;
  final String? unitId; // ← NUEVO: para expensas de unidad específica
  final String? userId; // ← NUEVO: usuario que creó la expensa
  final DateTime createdAt;
  final DateTime updatedAt; // ← NUEVO: campo updatedAt
  final List<Payment> payments;

  Expense({
    required this.id,
    required this.concept,
    required this.amount,
    required this.dueDate,
    this.period,
    required this.type,
    required this.status,
    required this.buildingId,
    this.unitId,
    this.userId,
    required this.createdAt,
    required this.updatedAt,
    this.payments = const [],
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id']?.toString() ?? '',
      concept: json['concept'] ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      dueDate:
          DateTime.parse(json['dueDate'] ?? DateTime.now().toIso8601String()),
      period: json['period']?.toString(),
      type: json['type'] ?? 'ORDINARY',
      status: json['status'] ?? 'OPEN',
      buildingId: json['buildingId']?.toString() ?? '',
      unitId: json['unitId']?.toString(),
      userId: json['userId']?.toString(),
      createdAt:
          DateTime.parse(json['createdAt'] ?? DateTime.now().toIso8601String()),
      updatedAt:
          DateTime.parse(json['updatedAt'] ?? DateTime.now().toIso8601String()),
      payments: (json['payments'] as List<dynamic>?)
              ?.map((payment) => Payment.fromJson(payment))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'concept': concept,
      'amount': amount,
      'dueDate': dueDate.toIso8601String(),
      'period': period,
      'type': type,
      'status': status,
      'buildingId': buildingId,
      'unitId': unitId,
      'userId': userId,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
      'payments': payments.map((payment) => payment.toJson()).toList(),
    };
  }

  // GETTERS para fácil acceso
  bool get isPaid => status == 'PAID';
  bool get isOverdue =>
      status == 'OVERDUE' ||
      (status == 'OPEN' && dueDate.isBefore(DateTime.now()));
  bool get isOpen => status == 'OPEN';
  bool get isGeneral => unitId == null; // Expensa general del edificio
  bool get isUnitSpecific => unitId != null; // Expensa de unidad específica

  // MÉTODO COPY-WITH para actualizaciones
  Expense copyWith({
    String? id,
    String? concept,
    double? amount,
    DateTime? dueDate,
    String? period,
    String? type,
    String? status,
    String? buildingId,
    String? unitId,
    String? userId,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<Payment>? payments,
  }) {
    return Expense(
      id: id ?? this.id,
      concept: concept ?? this.concept,
      amount: amount ?? this.amount,
      dueDate: dueDate ?? this.dueDate,
      period: period ?? this.period,
      type: type ?? this.type,
      status: status ?? this.status,
      buildingId: buildingId ?? this.buildingId,
      unitId: unitId ?? this.unitId,
      userId: userId ?? this.userId,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      payments: payments ?? this.payments,
    );
  }

  @override
  String toString() {
    return 'Expense(id: $id, concept: $concept, amount: $amount, status: $status)';
  }
}

class Payment {
  final String id;
  final double amount;
  final DateTime date;
  final String method;
  final String status; // ← NUEVO: estado del pago
  final String expenseId;
  final String userId;
  final String? transactionId; // ← NUEVO: ID de transacción
  final String? receiptUrl;

  Payment({
    required this.id,
    required this.amount,
    required this.date,
    required this.method,
    this.status = 'COMPLETED', // ← Valor por defecto
    required this.expenseId,
    required this.userId,
    this.transactionId,
    this.receiptUrl,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id']?.toString() ?? '',
      amount: (json['amount'] as num?)?.toDouble() ?? 0.0,
      date: DateTime.parse(json['date'] ?? DateTime.now().toIso8601String()),
      method: json['method'] ?? 'TRANSFER',
      status: json['status'] ?? 'COMPLETED',
      expenseId: json['expenseId']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      transactionId: json['transactionId']?.toString(),
      receiptUrl: json['receiptUrl']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'amount': amount,
      'date': date.toIso8601String(),
      'method': method,
      'status': status,
      'expenseId': expenseId,
      'userId': userId,
      'transactionId': transactionId,
      'receiptUrl': receiptUrl,
    };
  }

  bool get isCompleted => status == 'COMPLETED';
  bool get isPending => status == 'PENDING';
  bool get isFailed => status == 'FAILED';

  Payment copyWith({
    String? id,
    double? amount,
    DateTime? date,
    String? method,
    String? status,
    String? expenseId,
    String? userId,
    String? transactionId,
    String? receiptUrl,
  }) {
    return Payment(
      id: id ?? this.id,
      amount: amount ?? this.amount,
      date: date ?? this.date,
      method: method ?? this.method,
      status: status ?? this.status,
      expenseId: expenseId ?? this.expenseId,
      userId: userId ?? this.userId,
      transactionId: transactionId ?? this.transactionId,
      receiptUrl: receiptUrl ?? this.receiptUrl,
    );
  }
}
