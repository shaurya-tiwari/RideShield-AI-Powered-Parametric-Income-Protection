import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Force portrait orientation - feels more mobile-native
  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  runApp(const RideShieldApp());
}

class RideShieldApp extends StatelessWidget {
  const RideShieldApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RideShield',
      debugShowCheckedModeBanner: false,
      // Pure black theme to match the dark design of the site
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF6366F1), // RideShield indigo
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      home: const WebViewScreen(),
    );
  }
}

class WebViewScreen extends StatefulWidget {
  const WebViewScreen({super.key});

  @override
  State<WebViewScreen> createState() => _WebViewScreenState();
}

class _WebViewScreenState extends State<WebViewScreen> {
  late final WebViewController _controller;
  bool _isLoading = true; // Show loader while site is loading

  static const String _liveUrl = 'https://ride-shield-hazel.vercel.app/';

  @override
  void initState() {
    super.initState();
    _controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted) // JS must be ON for the site to work
      ..setBackgroundColor(const Color(0xFF0A0A0F)) // Dark bg to prevent white flash
      ..setNavigationDelegate(
        NavigationDelegate(
          onPageStarted: (url) {
            setState(() => _isLoading = true);
          },
          onPageFinished: (url) {
            setState(() => _isLoading = false);
          },
          onWebResourceError: (error) {
            setState(() => _isLoading = false);
          },
        ),
      )
      ..loadRequest(Uri.parse(_liveUrl));
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      // Handle Android back button - go back in web history instead of closing app
      canPop: false,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        if (await _controller.canGoBack()) {
          await _controller.goBack();
        } else {
          // If no web history left, exit the app
          SystemNavigator.pop();
        }
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0A0A0F),
        body: SafeArea(
          child: Stack(
            children: [
              // The actual website rendered full-screen
              WebViewWidget(controller: _controller),

              // Loading indicator shown while website is fetching
              if (_isLoading)
                Container(
                  color: const Color(0xFF0A0A0F),
                  child: const Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Brand logo placeholder
                        Text(
                          'RideShield',
                          style: TextStyle(
                            color: Color(0xFF6366F1),
                            fontSize: 32,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Income Protection Engine',
                          style: TextStyle(
                            color: Color(0xFF94A3B8),
                            fontSize: 14,
                          ),
                        ),
                        SizedBox(height: 40),
                        CircularProgressIndicator(
                          color: Color(0xFF6366F1),
                          strokeWidth: 2,
                        ),
                      ],
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
