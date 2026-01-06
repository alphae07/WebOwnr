// pages/api/verify-payment.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseConfig';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { reference, orderId } = req.body;

  if (!reference || !orderId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Verify payment with Paystack
    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      }
    );

    const data = await response.json();

    if (!data.status) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }

    const paymentData = data.data;

    // Update order in Firebase
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, {
      paymentStatus: paymentData.status === 'success' ? 'paid' : 'failed',
      status: paymentData.status === 'success' ? 'processing' : 'cancelled',
      paymentReference: reference,
      paymentDetails: {
        amount: paymentData.amount / 100, // Convert from kobo to main currency
        currency: paymentData.currency,
        channel: paymentData.channel,
        paidAt: paymentData.paid_at,
        transactionDate: paymentData.transaction_date,
      },
      updatedAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      paymentStatus: paymentData.status,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}