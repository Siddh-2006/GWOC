import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QrCode, ArrowRight, ShieldCheck, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';

const PaymentPage = () => {
    const [searchParams] = useSearchParams();
    const amount = searchParams.get('amount');
    const ref = searchParams.get('ref') || searchParams.get('id'); // Booking ID as ref
    const vpa = 'itssiddh7@okicici';
    const name = 'MindSettler';

    if (!amount) {
        return (
            <div className="min-h-screen pt-24 pb-12 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-800">Invalid Payment Link</h1>
                    <p className="text-gray-600">Please check your email for the correct link.</p>
                </div>
            </div>
        );
    }

    const upiLink = `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=Session Payment ${ref ? '#' + ref.slice(-6) : ''}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

    // Auto-redirect on mobile
    useEffect(() => {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            // Small delay to allow user to see the page before redirecting
            const timer = setTimeout(() => {
                window.location.href = upiLink;
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [upiLink]);

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-gray-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden"
            >
                <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-center text-white">
                    <h1 className="text-2xl font-bold mb-1">Complete Your Payment</h1>
                    <p className="text-pink-100 opacity-90">Secure UPI Gateway</p>
                </div>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <p className="text-gray-500 mb-1">Amount to Pay</p>
                        <p className="text-4xl font-bold text-gray-900">₹{amount}</p>
                        {ref && <p className="text-xs text-gray-400 mt-2 font-mono">Ref: {ref}</p>}
                    </div>

                    <div className="bg-white p-4 rounded-xl border-2 border-dashed border-gray-200 mb-6 flex justify-center relative">
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                            <QrCode size={150} />
                        </div>
                        <img
                            src={qrCodeUrl}
                            alt="Payment QR Code"
                            className="w-48 h-48 object-contain rounded-lg shadow-sm"
                        />
                    </div>

                    <div className="text-center mb-8">
                        <p className="text-sm text-gray-600 mb-2">Scan with any UPI App</p>
                        <div className="flex justify-center gap-4 opacity-70 grayscale hover:grayscale-0 transition-all">
                            {/* Simple text representation of apps for clean look */}
                            <span className="text-xs font-semibold bg-pink-50 text-pink-700 px-2 py-1 rounded">GPay</span>
                            <span className="text-xs font-semibold bg-pink-50 text-pink-700 px-2 py-1 rounded">PhonePe</span>
                            <span className="text-xs font-semibold bg-pink-50 text-pink-700 px-2 py-1 rounded">Paytm</span>
                            <span className="text-xs font-semibold bg-pink-50 text-pink-700 px-2 py-1 rounded">BHIM</span>
                        </div>
                    </div>

                    <a
                        href={upiLink}
                        className="block w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white text-center py-3.5 rounded-xl font-semibold shadow-lg shadow-pink-200 hover:shadow-pink-300 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        <Smartphone size={20} />
                        Pay Now on Mobile
                        <ArrowRight size={18} />
                    </a>

                    <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400">
                        <ShieldCheck size={14} className="text-green-500" />
                        <span>Secure Direct UPI Transfer</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PaymentPage;
