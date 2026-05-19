import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import paymentService from '../services/paymentService';
import { useToast } from '../contexts/ToastContext';

const Receipt = () => {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        setLoading(true);
        const data = await paymentService.getReceipt();
        console.log('[DEBUG] Receipt data:', data);
        
        // Check if data has the receipt object or error
        if (data && data.error) {
          setError(data.error);
        } else if (data && data._id) {
          // Receipt object received directly
          setReceipt(data);
        } else if (data) {
          // Wrapped receipt response
          setReceipt(data);
        } else {
          setError('No receipt data received');
        }
      } catch (err) {
        console.error('Error fetching receipt:', err);
        setError(err.response?.data?.error || 'Failed to load receipt. Please try again.');
        showToast('Failed to load receipt', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [showToast]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    showToast('PDF download feature coming soon', 'info');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            <p className="mt-4 text-gray-600">Loading receipt...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="min-h-screen bg-gray-50 pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Receipt Found</h2>
            <p className="text-gray-600 mb-6">{error || 'Please complete a payment first.'}</p>
            <button
              onClick={() => navigate('/premium')}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              Go to Premium Plans
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 print:bg-white">
      <div className="max-w-3xl mx-auto px-4">
        {/* Receipt Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 print:shadow-none print:p-0">
          {/* Top Section */}
          <div className="border-b pb-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">RECEIPT</h1>
              <p className="text-gray-600 mt-2">Payment Confirmation</p>
            </div>

            <div className="grid grid-cols-2 gap-8 text-sm">
              <div>
                <p className="text-gray-600 font-semibold mb-2">Transaction ID:</p>
                <p className="text-gray-900 font-mono break-all">{receipt.transactionId}</p>
              </div>
              <div className="text-right">
                <p className="text-gray-600 font-semibold mb-2">Payment Date:</p>
                <p className="text-gray-900">{new Date(receipt.paymentDate).toLocaleString()}</p>
              </div>

              <div className="col-span-2 mt-4">
                <p className="text-gray-600 font-semibold mb-1">Billed To:</p>
                <p className="text-gray-900 font-medium">{receipt.firstName || ''} {receipt.lastName || ''}</p>
                <p className="text-gray-600 text-sm">{receipt.email}</p>
                {receipt.phone && (
                  <p className="text-gray-600 text-sm">Mobile: {receipt.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subscription Plan:</span>
                <span className="font-semibold text-gray-900">{receipt.subscriptionPlan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-semibold text-gray-900">₹{receipt.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900 capitalize">
                  {receipt.paymentDetails?.method || 'Stripe'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-semibold text-green-600 capitalize">
                  {receipt.paymentDetails?.status || 'Completed'}
                </span>
              </div>
              {receipt.paymentDetails?.twoFactorAuth && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Verification:</span>
                  <span className="text-green-600 font-semibold text-xs">
                    {receipt.paymentDetails.twoFactorAuth}
                  </span>
                </div>
              )}
            </div>
          </div>

          
          <div className="bg-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Invoice Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Subscription Charges:</span>
                <span className="text-gray-900 font-semibold">₹{receipt.amount}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-700">Tax:</span>
                <span className="text-gray-900 font-semibold">₹0</span>
              </div>
              <div className="border-t border-gray-300 flex justify-between py-2 mt-4 font-bold">
                <span className="text-gray-900">Total Amount Paid:</span>
                <span className="text-blue-600">₹{receipt.amount}</span>
              </div>
            </div>
          </div>

          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center mb-8">
            <p className="text-green-800 font-semibold">✓ Payment Successful!</p>
            <p className="text-green-700 text-sm mt-1">
              Your premium membership is now active. You can now enjoy all premium features.
            </p>
          </div>

          
          <div className="flex gap-4 justify-center print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-all"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              📥 Download PDF
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold transition-all"
            >
              ✓ Go to Profile
            </button>
          </div>

          
          <div className="hidden print:block text-center text-xs text-gray-600 mt-8 pt-8 border-t">
            <p>Thank you for your purchase. This is an automated receipt generated by GoHire.</p>
            <p>For support, please contact: support@gohire.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
