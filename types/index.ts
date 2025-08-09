export interface Instructor {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  profileStatement: string;
  calendlyUrl: string;
  paystackEmail: string;
  paystackPublicKey: string;
}

export interface Booking {
  id: string;
  instructorId: string;
  clientName: string;
  clientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  status: "pending" | "confirmed" | "paid" | "cancelled";
  amount: number;
  paystackReference?: string;
  calendlyEventId?: string;
  createdAt: string;
}

export interface PaymentData {
  email: string;
  amount: number;
  reference: string;
  instructorEmail: string;
  bookingId: string;
}
