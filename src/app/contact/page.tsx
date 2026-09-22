"use client";

import { toast } from "sonner";
import { useState } from "react";

export default function ContactPage() {
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const email = "support@bhatia-stores.com";
  const whatsapp = "+910000000000"; // placeholder number

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      // Placeholder: In production integrate with an email service.
      toast.success("Your message request was logged. We'll get back to you shortly.");
      setEmailSent(true);
    } catch {
      toast.error("Failed to send message.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center px-4 py-12">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Bhatia Stores</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Have a question or need assistance? Reach out to us via email or WhatsApp.
        </p>
        <div className="mt-6 space-y-4">
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">Email:</p>
            <a href={`mailto:${email}`} className="text-primary-600 hover:underline dark:text-primary-400">
              {email}
            </a>
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-gray-200">WhatsApp:</p>
            <a href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline dark:text-primary-400">
              {whatsapp}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
