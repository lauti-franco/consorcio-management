import 'package:flutter/material.dart';

class DashboardTab {
  final IconData icon;
  final String label;
  final Widget content;

  DashboardTab({
    required this.icon,
    required this.label,
    required this.content,
  });
}

class DashboardTabView extends StatelessWidget {
  final List<DashboardTab> tabs;

  const DashboardTabView({super.key, required this.tabs});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: tabs.length,
      child: Scaffold(
        appBar: TabBar(
          tabs: tabs
              .map((tab) => Tab(
                    icon: Icon(tab.icon),
                    text: tab.label,
                  ))
              .toList(),
        ),
        body: TabBarView(
          children: tabs.map((tab) => tab.content).toList(),
        ),
      ),
    );
  }
}
