import { StyleSheet } from 'react-native';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
  },

  keyboardAvoidingView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 24,
    justifyContent: 'center',
  },

  // =========================
  // LOGO
  // =========================

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    // marginBottom: 10,
  },

  logoImage: {
    width: 500,
    height: 300,
  },

  // =========================
  // WELCOME
  // =========================

  welcomeContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
  },

  welcomeSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },

  // =========================
  // FORM
  // =========================

  formContainer: {
    width: '100%',
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    height: 56,
    paddingHorizontal: 16,
  },

  inputIcon: {
    marginRight: 12,
  },

  textInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
    paddingVertical: 0,
  },

  eyeButton: {
    padding: 4,
  },

  // =========================
  // FORGOT PASSWORD
  // =========================

  forgotPasswordWrapper: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 24,
  },

  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // =========================
  // LOGIN BUTTON
  // =========================

  loginButton: {
    height: 56,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },

  // =========================
  // DIVIDER
  // =========================

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },

  dividerLine: {
    flex: 1,
    height: 1,
  },

  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },

  // =========================
  // GOOGLE
  // =========================

  googleButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    width: '100%',
  },

  googleIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
  },

  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // =========================
  // FOOTER
  // =========================

  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },

  footerText: {
    fontSize: 14,
  },

  footerLink: {
    fontSize: 14,
    fontWeight: '700',
  },

  // =========================
  // ERROR
  // =========================

  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});