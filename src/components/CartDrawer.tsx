import { FormEvent, useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Minus,
  Plus,
  ShoppingBag,
  Snowflake,
  Ticket,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { calculateDeliveryFee, CartItem, PICKUP_OUTLETS } from '../data/menu';
import { MemberAccount } from './MemberAuthModal';
import { ResilientImage } from './ResilientImage';

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currentMember: MemberAccount | null;
  onClose: () => void;
  onUpdateQty: (cartId: string, delta: number) => void;
  onRemoveItem: (cartId: string) => void;
  onClearCart: () => void;
  onOpenSignUp: () => void;
  onRedeemVoucher: (memberId: string) => void;
}

type CheckoutStep = 'bag' | 'checkout' | 'confirmed';

interface ConfirmedOrder {
  orderNumber: string;
  fulfillment: 'delivery' | 'pickup';
  slotOrOutlet: string;
  total: number;
  discountApplied: number;
  customerName: string;
  addressSummary: string;
  paymentMethod: string;
  itemsCount: number;
}

export function CartDrawer({
  isOpen,
  items,
  currentMember,
  onClose,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOpenSignUp,
  onRedeemVoucher,
}: CartDrawerProps) {
  const [step, setStep] = useState<CheckoutStep>('bag');
  const [fulfillment, setFulfillment] = useState<'delivery' | 'pickup'>('delivery');
  const [deliverySlot, setDeliverySlot] = useState<string>('Next-Day (12:00 PM – 4:00 PM)');
  const [pickupOutlet, setPickupOutlet] = useState<string>(PICKUP_OUTLETS[0]);
  const [isRemoteZone, setIsRemoteZone] = useState<boolean>(false);
  const [applyMemberVoucher, setApplyMemberVoucher] = useState<boolean>(true);

  // Checkout form fields
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'PayNow' | 'Card' | 'Apple Pay'>('PayNow');
  const [formError, setFormError] = useState<string>('');
  const [confirmedOrder, setConfirmedOrder] = useState<ConfirmedOrder | null>(null);

  useEffect(() => {
    if (currentMember) {
      if (!fullName) setFullName(currentMember.name);
      if (!phone) setPhone(currentMember.phone);
    }
  }, [currentMember, fullName, phone]);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const deliveryFee = calculateDeliveryFee(subtotal, fulfillment, isRemoteZone);
  const canUseVoucher = Boolean(currentMember && !currentMember.voucherUsed && subtotal > 0);
  const voucherDiscount =
    canUseVoucher && applyMemberVoucher
      ? Math.min(currentMember!.voucherAmount, subtotal)
      : 0;
  const grandTotal = Math.max(0, subtotal - voucherDiscount + deliveryFee);

  let tierHint = '';
  let tierProgress = 0;
  if (fulfillment === 'pickup') {
    tierHint = 'Self-pickup at any BellyBellyGood outlet is always free.';
    tierProgress = 100;
  } else if (subtotal === 0) {
    tierHint = 'Free Singapore islandwide delivery on orders $121 and above.';
    tierProgress = 0;
  } else if (subtotal < 71) {
    const neededForMid = (71 - subtotal).toFixed(2);
    tierHint = `Add $${neededForMid} more to drop delivery fee from $15 to $12 (Free at $121).`;
    tierProgress = Math.min(100, (subtotal / 121) * 100);
  } else if (subtotal < 121) {
    const neededForFree = (121 - subtotal).toFixed(2);
    tierHint = `Add $${neededForFree} more to unlock FREE islandwide delivery!`;
    tierProgress = Math.min(100, (subtotal / 121) * 100);
  } else {
    tierHint = 'You unlocked FREE Singapore islandwide delivery.';
    tierProgress = 100;
  }

  const handlePlaceOrder = (e: FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!fullName.trim()) {
      setFormError('Please enter your name.');
      return;
    }
    if (!/^\d{8}$/.test(phone.replace(/\s+/g, ''))) {
      setFormError('Please enter a valid 8-digit Singapore mobile number.');
      return;
    }
    if (fulfillment === 'delivery') {
      if (!/^\d{6}$/.test(postalCode.trim())) {
        setFormError('Please enter a valid 6-digit Singapore postal code.');
        return;
      }
      if (!streetAddress.trim()) {
        setFormError('Please enter your block, street name, and unit number.');
        return;
      }
    }

    if (voucherDiscount > 0 && currentMember) {
      onRedeemVoucher(currentMember.id);
    }

    const orderNum = `BBG-${Math.floor(1000 + Math.random() * 9000)}`;
    setConfirmedOrder({
      orderNumber: orderNum,
      fulfillment,
      slotOrOutlet: fulfillment === 'delivery' ? deliverySlot : pickupOutlet,
      total: grandTotal,
      discountApplied: voucherDiscount,
      customerName: fullName.trim(),
      addressSummary:
        fulfillment === 'delivery'
          ? `${streetAddress.trim()}, Singapore ${postalCode.trim()}`
          : pickupOutlet,
      paymentMethod,
      itemsCount: totalCount,
    });
    onClearCart();
    setStep('confirmed');
  };

  const handleCloseDrawer = () => {
    if (step === 'confirmed') {
      setStep('bag');
      setConfirmedOrder(null);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Delivery Checkout"
      onClick={handleCloseDrawer}
    >
      <div
        className="w-full max-w-md h-full bg-[#FAF9F6] shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-[#E5E1D8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('bag')}
                aria-label="Back to bag"
                className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-zinc-700 hover:bg-[#F3F1EC]"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="font-display text-xl font-semibold text-zinc-900">
              {step === 'bag' && `Your Bag (${totalCount})`}
              {step === 'checkout' && 'Singapore Delivery Details'}
              {step === 'confirmed' && 'Order Confirmed'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleCloseDrawer}
            aria-label="Close bag"
            className="w-11 h-11 rounded-full flex items-center justify-center text-zinc-600 hover:bg-[#F3F1EC] hover:text-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {step === 'confirmed' && confirmedOrder ? (
          <div className="flex-1 overflow-y-auto px-5 py-8 space-y-6">
            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-11 h-11 text-[#1B3B2B] mx-auto" strokeWidth={1.75} />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#1B3B2B]">
                Order #{confirmedOrder.orderNumber} Confirmed
              </p>
              <h3 className="font-display text-2xl font-semibold text-zinc-900">
                Thank you, {confirmedOrder.customerName}
              </h3>
              <p className="text-sm text-zinc-600">
                Your {confirmedOrder.itemsCount} organic açaí{' '}
                {confirmedOrder.itemsCount === 1 ? 'item is' : 'items are'} queued for preparation in insulated thermal bags.
              </p>
            </div>

            <div className="bg-white border border-[#E5E1D8] rounded-2xl p-5 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Fulfillment</span>
                <span className="font-medium text-zinc-900 text-right">
                  {confirmedOrder.fulfillment === 'delivery' ? 'Islandwide Thermal Delivery' : 'Outlet Self-Pickup'}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">
                  {confirmedOrder.fulfillment === 'delivery' ? 'Delivery Window' : 'Pickup Outlet'}
                </span>
                <span className="font-medium text-zinc-900 text-right">{confirmedOrder.slotOrOutlet}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Destination</span>
                <span className="font-medium text-zinc-900 text-right">{confirmedOrder.addressSummary}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-zinc-500">Payment</span>
                <span className="font-medium text-zinc-900 text-right">{confirmedOrder.paymentMethod}</span>
              </div>
              {confirmedOrder.discountApplied > 0 && (
                <div className="flex justify-between gap-4 text-[#1B3B2B]">
                  <span>New Member Voucher</span>
                  <span className="font-semibold tabular-nums">
                    -${confirmedOrder.discountApplied.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between gap-4 pt-3 border-t border-[#E5E1D8]">
                <span className="font-semibold text-zinc-900">Total Paid</span>
                <span className="font-bold tabular-nums text-[#441E52]">
                  ${confirmedOrder.total.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="bg-[#E8EFEA] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#1B3B2B]">
              <Snowflake className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Care Note: Packed with cold packs in thermal bags. Please transfer pints and extra bowls straight into your freezer upon arrival.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCloseDrawer}
              className="w-full min-h-[48px] rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold transition-colors"
            >
              Back to Menu
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#F3F1EC] flex items-center justify-center text-zinc-500 mb-4">
              <ShoppingBag className="w-6 h-6" strokeWidth={1.75} />
            </div>
            <h3 className="font-display text-xl font-semibold text-zinc-900">Your bag is empty</h3>
            <p className="text-sm text-zinc-600 mt-1.5 max-w-xs">
              Explore BellyBellyGood Signature Bowls, Build Your Own, or Take-Home Pints for islandwide Singapore delivery.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold transition-colors"
            >
              Browse Menu
            </button>
          </div>
        ) : step === 'bag' ? (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Fulfillment toggle */}
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#EFECE6]">
                <button
                  type="button"
                  onClick={() => setFulfillment('delivery')}
                  className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    fulfillment === 'delivery'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  Islandwide Delivery
                </button>
                <button
                  type="button"
                  onClick={() => setFulfillment('pickup')}
                  className={`min-h-[42px] px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap ${
                    fulfillment === 'pickup'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  Outlet Pickup
                </button>
              </div>

              {/* Member $20 Voucher Callout */}
              {canUseVoucher ? (
                <label className="bg-[#E8EFEA] border border-[#1B3B2B]/15 rounded-2xl p-3.5 flex items-center justify-between gap-3 cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <Ticket className="w-4 h-4 text-[#1B3B2B] shrink-0" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#1B3B2B]">
                        Apply $20 New Member Voucher (WELCOME20)
                      </p>
                      <p className="text-[#1B3B2B]/80">Valid till 31st Dec</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={applyMemberVoucher}
                    onChange={(e) => setApplyMemberVoucher(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#1B3B2B]"
                  />
                </label>
              ) : !currentMember ? (
                <div className="bg-white border border-[#E5E1D8] rounded-2xl p-3.5 flex items-center justify-between gap-3">
                  <div className="text-xs">
                    <p className="font-semibold text-zinc-900">New members get $20 voucher</p>
                    <p className="text-zinc-500">Offer valid till 31st Dec</p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenSignUp}
                    className="min-h-[36px] px-3 py-1.5 rounded-lg bg-[#5D2E6D] text-white text-xs font-semibold whitespace-nowrap shrink-0"
                  >
                    Sign Up
                  </button>
                </div>
              ) : null}

              {/* Delivery fee tier progress */}
              <div className="bg-white border border-[#E5E1D8] rounded-2xl p-4 space-y-2.5">
                <p className="text-xs font-medium text-zinc-800">{tierHint}</p>
                <div className="h-1.5 w-full rounded-full bg-[#EFECE6] overflow-hidden">
                  <div
                    className="h-full bg-[#1B3B2B] transition-all duration-300"
                    style={{ width: `${tierProgress}%` }}
                  />
                </div>
                {fulfillment === 'delivery' && (
                  <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500 tabular-nums">
                    <span>≤$70: $15</span>
                    <span>$71–$120: $12</span>
                    <span>$121+: Free</span>
                  </div>
                )}
              </div>

              {/* Delivery window or Pickup outlet selector */}
              {fulfillment === 'delivery' ? (
                <div className="space-y-2">
                  <label htmlFor="slot-select" className="block text-xs font-semibold text-zinc-800">
                    Delivery Window (Order before 7 PM for Next-Day)
                  </label>
                  <select
                    id="slot-select"
                    value={deliverySlot}
                    onChange={(e) => setDeliverySlot(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[#5D2E6D]"
                  >
                    <option value="Next-Day (12:00 PM – 4:00 PM)">Next-Day (12:00 PM – 4:00 PM)</option>
                    <option value="Tomorrow Evening (5:00 PM – 8:30 PM)">
                      Tomorrow Evening (5:00 PM – 8:30 PM)
                    </option>
                    <option value="Weekend Afternoon (12:00 PM – 4:00 PM)">
                      Weekend Afternoon (12:00 PM – 4:00 PM)
                    </option>
                  </select>

                  <label className="flex items-center gap-2.5 pt-1 text-xs text-zinc-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isRemoteZone}
                      onChange={(e) => setIsRemoteZone(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#5D2E6D]"
                    />
                    <span>Delivering to Sentosa, Tuas, or Jurong Island (+$5.00)</span>
                  </label>
                </div>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="outlet-select" className="block text-xs font-semibold text-zinc-800">
                    Select Singapore Pickup Outlet
                  </label>
                  <select
                    id="outlet-select"
                    value={pickupOutlet}
                    onChange={(e) => setPickupOutlet(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm text-zinc-900 focus:outline-none focus:border-[#5D2E6D]"
                  >
                    {PICKUP_OUTLETS.map((outlet) => (
                      <option key={outlet} value={outlet}>
                        {outlet}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Cart Items */}
              <div className="divide-y divide-[#E5E1D8] border-t border-[#E5E1D8]">
                {items.map((item) => (
                  <div key={item.cartId} className="py-4 flex gap-3.5">
                    <div className="w-18 h-18 rounded-xl overflow-hidden bg-[#F3F1EC] shrink-0">
                      <ResilientImage
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-zinc-900 leading-snug">
                            {item.name}
                          </h4>
                          <p className="text-xs text-zinc-500 mt-0.5">{item.sizeLabel}</p>
                        </div>
                        <span className="text-sm font-semibold tabular-nums text-zinc-900 shrink-0">
                          ${(item.unitPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {item.drizzle && (
                        <p className="text-xs text-zinc-600 mt-1">Drizzle: {item.drizzle}</p>
                      )}
                      {item.addOns.length > 0 && (
                        <p className="text-xs text-zinc-600 mt-0.5">
                          Extras: {item.addOns.join(', ')}
                        </p>
                      )}
                      {item.customDetails && item.customDetails.length > 0 && (
                        <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                          {item.customDetails.join(' · ')}
                        </p>
                      )}
                      {item.notes && (
                        <p className="text-xs text-[#5D2E6D] mt-0.5">Note: “{item.notes}”</p>
                      )}

                      <div className="mt-2.5 flex items-center justify-between">
                        <div className="inline-flex items-center border border-[#E5E1D8] rounded-lg bg-white">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartId, -1)}
                            aria-label={`Decrease quantity of ${item.name}`}
                            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-zinc-950"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.cartId, 1)}
                            aria-label={`Increase quantity of ${item.name}`}
                            className="w-9 h-9 flex items-center justify-center text-zinc-700 hover:text-zinc-950"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemoveItem(item.cartId)}
                          aria-label={`Remove ${item.name}`}
                          className="min-h-[36px] px-2 text-xs text-zinc-500 hover:text-red-700 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer totals */}
            <div className="bg-white border-t border-[#E5E1D8] px-5 py-4 space-y-3 shrink-0">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Subtotal</span>
                  <span className="tabular-nums font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {voucherDiscount > 0 && (
                  <div className="flex justify-between text-[#1B3B2B]">
                    <span>New Member Voucher (WELCOME20)</span>
                    <span className="tabular-nums font-semibold">-${voucherDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-zinc-600">
                  <span>
                    {fulfillment === 'delivery' ? 'Islandwide Thermal Delivery' : 'Self-Pickup'}
                  </span>
                  <span className="tabular-nums font-medium">
                    {deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-900 pt-1.5 border-t border-[#E5E1D8]">
                  <span>Total (SGD)</span>
                  <span className="tabular-nums text-[#441E52]">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold flex items-center justify-between transition-colors"
              >
                <span>Proceed to Checkout</span>
                <span className="tabular-nums">${grandTotal.toFixed(2)}</span>
              </button>
            </div>
          </>
        ) : (
          /* Checkout Form */
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
              {formError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-800"
                >
                  {formError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label htmlFor="sg-name" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Recipient Name
                  </label>
                  <input
                    id="sg-name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Cheryl Tan"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm focus:outline-none focus:border-[#5D2E6D]"
                  />
                </div>

                <div>
                  <label htmlFor="sg-phone" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                    Singapore Mobile (+65)
                  </label>
                  <input
                    id="sg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9123 4567"
                    className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm tabular-nums focus:outline-none focus:border-[#5D2E6D]"
                  />
                </div>

                {fulfillment === 'delivery' && (
                  <>
                    <div>
                      <label htmlFor="sg-postal" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Singapore Postal Code
                      </label>
                      <input
                        id="sg-postal"
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 428801"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm tabular-nums focus:outline-none focus:border-[#5D2E6D]"
                      />
                    </div>

                    <div>
                      <label htmlFor="sg-address" className="block text-xs font-semibold text-zinc-800 mb-1.5">
                        Block, Street & Unit Number
                      </label>
                      <input
                        id="sg-address"
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="e.g. Blk 168 East Coast Road, #04-12"
                        className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-[#E5E1D8] bg-white text-sm focus:outline-none focus:border-[#5D2E6D]"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="border-t border-[#E5E1D8] pt-4">
                <span className="block text-xs font-semibold text-zinc-800 mb-2.5">
                  Payment Method
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(['PayNow', 'Card', 'Apple Pay'] as const).map((method) => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                        paymentMethod === method
                          ? 'border-[#5D2E6D] bg-[#5D2E6D]/8 text-[#441E52]'
                          : 'border-[#E5E1D8] bg-white text-zinc-700 hover:border-zinc-400'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-[#E8EFEA] rounded-2xl p-4 flex items-start gap-3 text-xs text-[#1B3B2B]">
                <Snowflake className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Thermal Guarantee: Every order ships in an insulated foil bag with ice packs to keep your organic Brazilian açaí firm in Singapore’s heat.
                </p>
              </div>
            </div>

            <div className="bg-white border-t border-[#E5E1D8] px-5 py-4 shrink-0">
              <button
                type="submit"
                className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-[#5D2E6D] hover:bg-[#441E52] text-white text-sm font-semibold flex items-center justify-between transition-colors"
              >
                <span>Confirm & Pay ({paymentMethod})</span>
                <span className="tabular-nums">${grandTotal.toFixed(2)}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
