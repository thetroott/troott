import { Redirect } from 'expo-router';

/** Legacy route — activation uses the same OTP flow as verify-email. */
export default function ActivateUserAccountScreen() {
    return <Redirect href="/verify-email" />;
}
