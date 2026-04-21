import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:movara_shift_hub/providers/providers.dart';
import 'package:movara_shift_hub/shared/app_colors.dart';

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _firstName = TextEditingController();
  final _lastName = TextEditingController();
  final _country = TextEditingController();
  final _phoneCountryCode = TextEditingController(text: '+1');
  final _company = TextEditingController();
  final _phone = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _emergency = TextEditingController();
  final _notes = TextEditingController();
  final _picker = ImagePicker();
  DateTime? _dateOfBirth;
  XFile? _passportImage;
  int _step = 0;
  bool _loading = false;
  String? _error;
  String? _info;
  bool _awaitingVerification = false;
  final _verificationCode = TextEditingController();

  @override
  void dispose() {
    _firstName.dispose();
    _lastName.dispose();
    _country.dispose();
    _phoneCountryCode.dispose();
    _company.dispose();
    _phone.dispose();
    _email.dispose();
    _password.dispose();
    _emergency.dispose();
    _notes.dispose();
    _verificationCode.dispose();
    super.dispose();
  }

  bool _validateStep() {
    if (_step == 0) {
      return _firstName.text.trim().isNotEmpty &&
          _lastName.text.trim().isNotEmpty &&
          _email.text.trim().isNotEmpty &&
          _password.text.trim().length >= 6;
    }
    if (_step == 1) {
      return _dateOfBirth != null &&
          _country.text.trim().isNotEmpty &&
          _phoneCountryCode.text.trim().isNotEmpty &&
          _phone.text.trim().isNotEmpty;
    }
    return _passportImage != null;
  }

  void _nextStep() {
    if (!_validateStep()) {
      setState(() => _error = 'Please fill all required fields for this step.');
      return;
    }
    setState(() {
      _error = null;
      if (_step < 2) _step += 1;
    });
  }

  void _prevStep() {
    setState(() {
      _error = null;
      if (_step > 0) _step -= 1;
    });
  }

  Future<void> _pickDateOfBirth() async {
    final now = DateTime.now();
    final selected = await showDatePicker(
      context: context,
      initialDate: DateTime(now.year - 21, now.month, now.day),
      firstDate: DateTime(1950),
      lastDate: DateTime(now.year - 18, now.month, now.day),
    );
    if (selected == null) return;
    setState(() => _dateOfBirth = selected);
  }

  Future<void> _pickPassportImage() async {
    final image = await _picker.pickImage(source: ImageSource.gallery, imageQuality: 85);
    if (image == null) return;
    setState(() => _passportImage = image);
  }

  Future<void> _submit() async {
    if (!_validateStep() || _dateOfBirth == null || _passportImage == null) {
      setState(() => _error = 'Please complete all required fields.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
      _info = null;
    });
    try {
      await ref.read(authNotifierProvider.notifier).registerGuard(
            email: _email.text.trim(),
            password: _password.text.trim(),
            firstName: _firstName.text.trim(),
            lastName: _lastName.text.trim(),
            dateOfBirth: _dateOfBirth!,
            country: _country.text.trim(),
            phoneCountryCode: _phoneCountryCode.text.trim(),
            phone: _phone.text.trim(),
            passportImagePath: _passportImage!.path,
            companyName: _company.text.trim().isEmpty ? null : _company.text.trim(),
            emergencyContact: _emergency.text.trim(),
            registrationNotes: _notes.text.trim(),
          );
      setState(() {
        _awaitingVerification = true;
        _info = 'We sent a 6-digit verification code to your email. Enter it below.';
      });
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _verifyEmailCode() async {
    final code = _verificationCode.text.trim();
    if (code.length != 6) {
      setState(() => _error = 'Enter the 6-digit code from your email.');
      return;
    }
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      await ref.read(authNotifierProvider.notifier).verifyGuardEmail(
            email: _email.text.trim(),
            code: code,
          );
      if (!mounted) return;
      context.go('/login');
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final stepTitle = switch (_step) {
      0 => 'Step 1/3: Account',
      1 => 'Step 2/3: Identity',
      _ => 'Step 3/3: Documents',
    };
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const SizedBox(height: 24),
              Text(
                'Guard Sign up',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: AppColors.foreground,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                stepTitle,
                textAlign: TextAlign.center,
                style: TextStyle(color: AppColors.mutedForeground, fontWeight: FontWeight.w600),
              ),
              const SizedBox(height: 16),
              if (_step == 0) ...[
                TextField(controller: _firstName, decoration: const InputDecoration(labelText: 'First name *')),
                const SizedBox(height: 12),
                TextField(controller: _lastName, decoration: const InputDecoration(labelText: 'Last name *')),
                const SizedBox(height: 12),
                TextField(
                  controller: _email,
                  keyboardType: TextInputType.emailAddress,
                  decoration: const InputDecoration(labelText: 'Email *'),
                ),
                const SizedBox(height: 12),
                TextField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password *')),
              ],
              if (_step == 1) ...[
                OutlinedButton(
                  onPressed: _pickDateOfBirth,
                  child: Text(
                    _dateOfBirth == null
                        ? 'Select date of birth *'
                        : 'Date of birth: ${_dateOfBirth!.toIso8601String().substring(0, 10)}',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(controller: _country, decoration: const InputDecoration(labelText: 'Country *')),
                const SizedBox(height: 12),
                TextField(
                  controller: _phoneCountryCode,
                  keyboardType: TextInputType.phone,
                  decoration: const InputDecoration(labelText: 'Phone country code *'),
                ),
                const SizedBox(height: 12),
                TextField(controller: _phone, keyboardType: TextInputType.phone, decoration: const InputDecoration(labelText: 'Phone number *')),
              ],
              if (_step == 2) ...[
                OutlinedButton(
                  onPressed: _pickPassportImage,
                  child: Text(
                    _passportImage == null
                        ? 'Upload passport image *'
                        : 'Passport image selected: ${_passportImage!.name}',
                  ),
                ),
                const SizedBox(height: 12),
                TextField(controller: _company, decoration: const InputDecoration(labelText: 'Company name (optional)')),
                const SizedBox(height: 12),
                TextField(controller: _emergency, decoration: const InputDecoration(labelText: 'Emergency contact (optional)')),
                const SizedBox(height: 12),
                TextField(controller: _notes, maxLines: 3, decoration: const InputDecoration(labelText: 'Notes (optional)')),
              ],
              if (_error != null) ...[
                const SizedBox(height: 12),
                Text(_error!, style: TextStyle(color: AppColors.destructive)),
              ],
              if (_info != null) ...[
                const SizedBox(height: 12),
                Text(_info!, style: TextStyle(color: AppColors.success)),
              ],
              if (_awaitingVerification) ...[
                const SizedBox(height: 16),
                TextField(
                  controller: _verificationCode,
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                  decoration: const InputDecoration(labelText: 'Email verification code *'),
                ),
              ],
              const SizedBox(height: 20),
              if (_awaitingVerification)
                FilledButton(
                  onPressed: _loading ? null : _verifyEmailCode,
                  child: _loading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text('Verify email'),
                )
              else
                Row(
                  children: [
                    if (_step > 0)
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _loading ? null : _prevStep,
                          child: const Text('Back'),
                        ),
                      ),
                    if (_step > 0) const SizedBox(width: 12),
                    Expanded(
                      child: FilledButton(
                        onPressed: _loading ? null : (_step < 2 ? _nextStep : _submit),
                        child: _loading
                            ? const SizedBox(
                                height: 22,
                                width: 22,
                                child: CircularProgressIndicator(strokeWidth: 2),
                              )
                            : Text(_step < 2 ? 'Next' : 'Create account'),
                      ),
                    ),
                  ],
                ),
              const SizedBox(height: 12),
              TextButton(
                onPressed: () => context.go('/login'),
                child: const Text('Already have account? Sign in'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
