import React, { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle } from 'lucide-react';
import {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
  validateCardholderName,
  getCardType,
  formatCardNumber,
  formatExpiryDate,
  isTestCard,
  TEST_CARDS,
} from '../../utils/cardValidation';

interface CardPaymentFormProps {
  onSubmit: (cardData: CardData) => void;
  loading?: boolean;
}

export interface CardData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  cardType: string;
}

const CardPaymentForm: React.FC<CardPaymentFormProps> = ({ onSubmit, loading }) => {
  const [cardNumber, setCardNumber] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [touched, setTouched] = useState<{ [key: string]: boolean }>({});

  const cardType = getCardType(cardNumber);
  const isTest = isTestCard(cardNumber);

  // Automatically truncate CVV if card type changes
  React.useEffect(() => {
    const maxLength = cardType === 'American Express' ? 4 : 3;
    if (cvv.length > maxLength) {
      setCvv(cvv.slice(0, maxLength));
    }
  }, [cardType, cvv]);

  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case 'cardNumber':
        if (!value) {
          newErrors.cardNumber = 'Card number is required';
        } else if (!validateCardNumber(value)) {
          newErrors.cardNumber = 'Invalid card number';
        } else {
          delete newErrors.cardNumber;
        }
        break;

      case 'cardholderName':
        if (!value) {
          newErrors.cardholderName = 'Cardholder name is required';
        } else if (!validateCardholderName(value)) {
          newErrors.cardholderName = 'Invalid name (letters and spaces only)';
        } else {
          delete newErrors.cardholderName;
        }
        break;

      case 'expiryDate':
        if (!value) {
          newErrors.expiryDate = 'Expiry date is required';
        } else if (!validateExpiryDate(value)) {
          newErrors.expiryDate = 'Invalid or expired date';
        } else {
          delete newErrors.expiryDate;
        }
        break;

      case 'cvv':
        if (!value) {
          newErrors.cvv = 'CVV is required';
        } else if (!validateCVV(value, cardType)) {
          newErrors.cvv = `Invalid CVV (${cardType === 'American Express' ? '4' : '3'} digits)`;
        } else {
          delete newErrors.cvv;
        }
        break;
    }

    setErrors(newErrors);
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/\s/g, ''); // Remove all spaces
    
    // Allow only up to 19 digits
    if (input.length <= 19) {
      const formatted = formatCardNumber(input);
      setCardNumber(formatted);
      if (touched.cardNumber) {
        validateField('cardNumber', formatted);
      }
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiryDate(e.target.value);
    if (formatted.replace(/\D/g, '').length <= 4) {
      setExpiryDate(formatted);
      if (touched.expiryDate) {
        validateField('expiryDate', formatted);
      }
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    const maxLength = cardType === 'American Express' ? 4 : 3;
    if (value.length <= maxLength) {
      setCvv(value);
      if (touched.cvv) {
        validateField('cvv', value);
      }
    }
  };

  const handleBlur = (field: string, value: string) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const allTouched = { cardNumber: true, cardholderName: true, expiryDate: true, cvv: true };
    setTouched(allTouched);

    validateField('cardNumber', cardNumber);
    validateField('cardholderName', cardholderName);
    validateField('expiryDate', expiryDate);
    validateField('cvv', cvv);

    // Check if there are any errors
    const hasErrors =
      !validateCardNumber(cardNumber) ||
      !validateCardholderName(cardholderName) ||
      !validateExpiryDate(expiryDate) ||
      !validateCVV(cvv, cardType);

    if (!hasErrors) {
      onSubmit({
        cardNumber: cardNumber.replace(/\s/g, ''),
        cardholderName,
        expiryDate,
        cvv,
        cardType,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Test Mode Indicator */}
      {isTest && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={18} className="text-yellow-600" />
          <span className="text-sm text-yellow-800 font-medium">Test Card Detected - No actual charge will be made</span>
        </div>
      )}

      {/* Card Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Card Number
        </label>
        <div className="relative">
          <input
            type="text"
            value={cardNumber}
            onChange={handleCardNumberChange}
            onBlur={() => handleBlur('cardNumber', cardNumber)}
            placeholder="1234 5678 9012 3456"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.cardNumber && touched.cardNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {cardType !== 'Unknown' && (
              <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {cardType}
              </span>
            )}
            <CreditCard size={20} className="text-gray-400" />
          </div>
        </div>
        {errors.cardNumber && touched.cardNumber && (
          <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>
        )}
      </div>

      {/* Cardholder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Cardholder Name
        </label>
        <input
          type="text"
          value={cardholderName}
          onChange={(e) => setCardholderName(e.target.value.toUpperCase())}
          onBlur={() => handleBlur('cardholderName', cardholderName)}
          placeholder="Himanshu Kumar"
          className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
            errors.cardholderName && touched.cardholderName ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={loading}
        />
        {errors.cardholderName && touched.cardholderName && (
          <p className="text-red-500 text-xs mt-1">{errors.cardholderName}</p>
        )}
      </div>

      {/* Expiry and CVV */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <input
            type="text"
            value={expiryDate}
            onChange={handleExpiryChange}
            onBlur={() => handleBlur('expiryDate', expiryDate)}
            placeholder="MM/YY"
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.expiryDate && touched.expiryDate ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.expiryDate && touched.expiryDate && (
            <p className="text-red-500 text-xs mt-1">{errors.expiryDate}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            CVV
          </label>
          <input
            type="text"
            value={cvv}
            onChange={handleCvvChange}
            onBlur={() => handleBlur('cvv', cvv)}
            placeholder={cardType === 'American Express' ? '1234' : '123'}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${
              errors.cvv && touched.cvv ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          />
          {errors.cvv && touched.cvv && (
            <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
          )}
        </div>
      </div>

      {/* Test Cards Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">Test Cards (Development)</h4>
        <div className="text-xs text-blue-700 space-y-1">
          <p>• Visa: {TEST_CARDS.VISA_SUCCESS}</p>
          <p>• Mastercard: {TEST_CARDS.MASTERCARD_SUCCESS}</p>
          <p>• Decline Test: {TEST_CARDS.CARD_DECLINED}</p>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-hover transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CheckCircle size={20} />
            Pay Securely
          </>
        )}
      </button>
    </form>
  );
};

export default CardPaymentForm;
