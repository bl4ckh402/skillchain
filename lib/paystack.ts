// paystack.ts

export function initializePaystackPayment({
  email,
  amount,
  reference,
  publicKey,
  onSuccess,
  onClose,
}: {
  email: string;
  amount: number;
  reference: string;
  publicKey: string;
  onSuccess: (response: any) => void;
  onClose: () => void;
}) {
  // This is a placeholder. Integrate Paystack inline script here.
  // For now, simulate a successful payment after 2 seconds.
  setTimeout(() => {
    onSuccess({ reference });
  }, 2000);
}

export function generatePaymentReference(): string {
  return "REF-" + Math.random().toString(36).substr(2, 9).toUpperCase();
}
