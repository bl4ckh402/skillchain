// context/PaymentProvider.tsx
import { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { stripePromise } from '@/lib/stripe';

export function PaymentsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [stripeAccount, setStripeAccount] = useState<StripeAccount>({ connected: false });
  const [loading, setLoading] = useState({
    transactions: false,
    earnings: false,
    stripeAccount: false,
    payouts: false
  });

  // Connect with Stripe - initiate OAuth flow
  const connectWithStripe = async (): Promise<string> => {
    if (!user) throw new Error('Must be logged in to connect with Stripe');
    
    try {
      const response = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to connect with Stripe');
      }

      // Update local state
      setStripeAccount({ connected: true });
      
      return data.url;
    } catch (error: any) {
      console.error('Error connecting with Stripe:', error);
      throw new Error(`Error connecting with Stripe: ${error.message}`);
    }
  };

  // Get Stripe account status
  const getStripeAccountStatus = async (): Promise<StripeAccount> => {
    if (!user) return { connected: false };
    
    setLoading(prev => ({ ...prev, stripeAccount: true }));
    
    try {
      const response = await fetch(`/api/stripe/account-status?userId=${user.uid}`);
      const data = await response.json();

      if (response.ok) {
        setStripeAccount(data);
        return data;
      }

      return { connected: false };
    } catch (error) {
      console.error('Error fetching Stripe account status:', error);
      return { connected: false };
    } finally {
      setLoading(prev => ({ ...prev, stripeAccount: false }));
    }
  };

  // Initialize Stripe on mount
  useEffect(() => {
    if (user) {
      getStripeAccountStatus();
    }
  }, [user]);

  return (
    <PaymentsContext.Provider 
      value={{
        stripeAccount,
        loading,
        connectWithStripe,
        getStripeAccountStatus
      }}
    >
      {children}
    </PaymentsContext.Provider>
  );
}