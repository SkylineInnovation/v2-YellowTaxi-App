// Firebase Recaptcha component for phone authentication
import React from 'react';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { firebaseApp } from '../../config/firebase';

interface FirebaseRecaptchaProps {
  recaptchaVerifier: React.RefObject<FirebaseRecaptchaVerifierModal>;
  onVerify?: () => void;
}

export const FirebaseRecaptcha: React.FC<FirebaseRecaptchaProps> = ({
  recaptchaVerifier,
  onVerify,
}) => {
  // Get Firebase config from the app
  const firebaseConfig = firebaseApp.options;

  return (
    <FirebaseRecaptchaVerifierModal
      ref={recaptchaVerifier}
      firebaseConfig={firebaseConfig}
      attemptInvisibleVerification={true}
      androidHardwareAccelerationDisabled={false}
      androidLayerType="software"
      onVerify={onVerify}
      title="Verify you are human"
      cancelLabel="Cancel"
    />
  );
};
