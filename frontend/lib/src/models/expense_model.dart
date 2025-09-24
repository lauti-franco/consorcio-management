class Expense {
  final String id;
  final String concept;
  final double amount;
  final DateTime dueDate;
  final String status;
  final String buildingId;
  final DateTime createdAt;
  final List<Payment> payments;

  Expense({
    required this.id,
    required this.concept,
    required this.amount,
    required this.dueDate,
    required this.status,
    required this.buildingId,
    required this.createdAt,
    this.payments = const [],
  });

  factory Expense.fromJson(Map<String, dynamic> json) {
    return Expense(
      id: json['id'],
      concept: json['concept'],
      amount: (json['amount'] as num).toDouble(),
      dueDate: DateTime.parse(json['dueDate']),
      status: json['status'],
      buildingId: json['buildingId'],
      createdAt: DateTime.parse(json['createdAt']),
      payments: (json['payments'] as List<dynamic>?)
              ?.map((payment) => Payment.fromJson(payment))
              .toList() ??
          [],
    );
  }

  bool get isPaid => status == 'PAID';
  bool get isOverdue => status == 'OVERDUE';
  bool get isOpen => status == 'OPEN';
}

class Payment {
  final String id;
  final double amount;
  final DateTime date;
  final String method;
  final String expenseId;
  final String userId;
  final String? receiptUrl;

  Payment({
    required this.id,
    required this.amount,
    required this.date,
    required this.method,
    required this.expenseId,
    required this.userId,
    this.receiptUrl,
  });

  factory Payment.fromJson(Map<String, dynamic> json) {
    return Payment(
      id: json['id'],
      amount: (json['amount'] as num).toDouble(),
      date: DateTime.parse(json['date']),
      method: json['method'],
      expenseId: json['expenseId'],
      userId: json['userId'],
      receiptUrl: json['receiptUrl'],
    );
  }
}
