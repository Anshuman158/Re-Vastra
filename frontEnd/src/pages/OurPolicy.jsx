import React from 'react';

const OurPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 mt-20 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl font-bold text-center text-red-600 mb-6">ReVastra Return & Refund Policy</h1>
      <p className="text-gray-700 mb-4">The following rules apply when returning rented products from <a href="https://www.revastra.org" className="text-blue-500 underline">www.revastra.org</a>:</p>

      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>By using our website, you agree to follow this return policy.</li>
        <li>The policy applies after delivery and up to 4 days after returning the product.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-red-500 mt-6">Return Policies</h2>
      <ul className="list-decimal list-inside text-gray-700 space-y-2 mt-2">
        <li><span className='font-bold'>Late Returns</span> – ₹300 per day penalty, legal action after 7-10 days.</li>
        <li>Return in the same packaging as delivered.</li>
        <li>Hand over only to an authorized representative.</li>
        <li>You bear responsibility for self-return damages.</li>
        <li>Refunds for damaged/late deliveries within 15 working days.</li>
        <li>Security deposits refunded within 15 working days.</li>
        <li><span className='font-bold'>Damaged product:</span> Borrower must pay full amount, else legal action.</li>
        <li><span className='font-bold'>Order Cancellations:</span> Full refund if canceled by us; service charge applies if canceled at the doorstep.</li>
      </ul>

      <h1 className="text-3xl font-bold text-center text-red-600 mt-8 mb-6">ReVastra Privacy Policy</h1>
      <h2 className="text-2xl font-semibold text-red-500">Information We Collect</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
        <li>Non-personal data (browser type, visit time) to improve services.</li>
        <li>Personal data (name, email, payment details) for transactions.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-red-500 mt-6">How We Use Your Data</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
        <li>To improve services and user experience.</li>
        <li>To send updates and offers.</li>
        <li>To maintain security and prevent fraud.</li>
      </ul>

      <h2 className="text-2xl font-semibold text-red-500 mt-6">Security & Third-Party Policies</h2>
      <ul className="list-disc list-inside text-gray-700 space-y-2 mt-2">
        <li>We take reasonable steps to secure data.</li>
        <li>We use ads & cookies for personalization.</li>
        <li>We do not sell personal data but may share it when required by law.</li>
      </ul>

      <h1 className="text-3xl font-bold text-center text-red-600 mt-8 mb-6">Contract & Delivery Process</h1>
      <ul className="list-disc list-inside text-gray-700 space-y-2">
        <li>Users sign a contract upon delivery stating they will comply with policies.</li>
        <li>Delivery personnel verify product condition with video/photo proof.</li>
        <li><span className='font-bold'>Open Box Delivery:</span> The product is checked at the time of delivery.</li>
        <li>User must provide a photo with the product or valid ID as proof of receipt.</li>
      </ul>
    </div>
  );
};

export default OurPolicy;
