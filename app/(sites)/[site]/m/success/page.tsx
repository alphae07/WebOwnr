"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";
import { CheckCircle, Package, Truck, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderData {
  orderId: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  pricing: {
    subtotal: number;
    shipping: number;
    platformFee: number;
    total: number;
  };
  status: string;
  createdAt: any;
}

const Success = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("order");
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        router.push("/");
        return;
      }

      try {
        const orderRef = doc(db, "orders", orderId);
        const orderSnap = await getDoc(orderRef);

        if (orderSnap.exists()) {
          setOrderData({ orderId: orderSnap.id, ...orderSnap.data() } as OrderData);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!orderData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600">
              Thank you for your purchase, {orderData.customerInfo.firstName}!
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-600">Order Number</p>
                  <p className="text-lg font-semibold text-gray-900">
                    #{orderData.orderId.slice(0, 8).toUpperCase()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ${orderData.pricing.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-6">
              <h3 className="font-semibold text-gray-900">Order Items</h3>
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Shipping Address */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
              <p className="text-gray-600 text-sm">
                {orderData.shippingAddress.address}
                <br />
                {orderData.shippingAddress.city}, {orderData.shippingAddress.state}{" "}
                {orderData.shippingAddress.zipCode}
                <br />
                {orderData.shippingAddress.country}
              </p>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">What happens next?</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Confirmation</p>
                  <p className="text-sm text-gray-600">
                    You'll receive a confirmation email and WhatsApp message shortly
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Order Processing</p>
                  <p className="text-sm text-gray-600">
                    We'll prepare your items for shipment within 1-2 business days
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Shipping & Delivery</p>
                  <p className="text-sm text-gray-600">
                    Estimated delivery: 5-7 business days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-blue-50 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-3">
              <MessageCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-medium text-gray-900 mb-1">
                  Questions about your order?
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  We've sent a confirmation to {orderData.customerInfo.email}. If you
                  have any questions, please contact the seller.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={() => router.push("/")}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Success;