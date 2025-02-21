'use client'
import { X } from "lucide-react";
import React, { useState } from "react";


const EmailTwitterModal = ({ isOpen, onClose, walletAddress }: { isOpen: boolean, onClose: () => void, walletAddress: string }) => {
    const [email, setEmail] = useState('');
    const [twitter, setTwitter] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
   
    const handleSubmit = async (e: any) => {
      e.preventDefault();
       setIsSubmitting(true);
      
      try {
          // Create user if doesn't exist
          await fetch('/api/database/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wallet_address: walletAddress,
              user_email: email,
              user_twitter: twitter
            })
          });
        onClose();
      } catch (error) {
        console.error('Error:', error);
      }
    };
   
    if (!isOpen) return null;
   
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-[450px] relative">
        <X className="text-black h-[45] w-[45] absolute right-4 cursor-pointer" onClick={onClose} />
          <h3 className="text-lg font-semibold my-6 text-black">Let&apos;s Complete Your Profile</h3>
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded mb-3 text-black"
            />
            <input
              type="text"
              placeholder="Twitter Username"
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              className="w-full p-2 border rounded mb-4 text-black"
            />
            <button type="submit" className="w-full bg-black text-white rounded-lg py-2">
              {!isSubmitting ? "Submit" : "Processing"}
            </button>
          </form>
        </div>
      </div>
    );
   };

   export default EmailTwitterModal;