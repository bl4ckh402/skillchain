import { RecaptchaVerifier as FirebaseRecaptchaVerifier } from 'firebase/auth';

declare global {
  interface Window {
    recaptchaVerifier: FirebaseRecaptchaVerifier;
  }
}