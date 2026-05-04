import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    });

    const { amount, currency = 'INR', receipt } = await req.json();

    if (!amount) {
      return NextResponse.json({ message: 'Amount is required' }, { status: 400 });
    }

    // Razorpay expects amount in paise (multiply by 100)
    const options = {
      amount: Math.round(parseFloat(amount) * 100),
      currency,
      receipt: receipt || `order_rcpt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Razorpay Order Creation Error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to create Razorpay order' },
      { status: 500 }
    );
  }
}
