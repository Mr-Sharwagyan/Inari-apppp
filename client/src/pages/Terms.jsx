import React from "react";

const Terms = () => {
  return (
    <div className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-400 mb-10">
          Effective Date: May 2026 – INARI System
        </p>

        {/* Content */}
        <section className="space-y-6 text-sm leading-6">

          <div>
            <h2 className="text-lg font-semibold text-black">1. Acceptance of Terms</h2>
            <p>
              By accessing or using INARI System, you agree to be bound by these Terms of Service.
              If you do not agree, please do not use the platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">2. Use of the System</h2>
            <p>
              You agree to use INARI System only for lawful purposes. You must not misuse the system,
              attempt unauthorized access, or interfere with its operation.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">3. User Accounts</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account credentials.
              Any activity under your account is your responsibility.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">4. Orders and Payments</h2>
            <p>
              All orders placed through INARI System are subject to availability and confirmation.
              We reserve the right to cancel or refuse any order.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">5. Pricing and Changes</h2>
            <p>
              Prices may change without prior notice. We are not responsible for typographical errors
              in product listings or pricing.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">6. Prohibited Activities</h2>
            <p>
              You agree not to:
              <br />• Hack or damage the system
              <br />• Use fake accounts
              <br />• Upload harmful or illegal content
              <br />• Attempt fraud or unauthorized transactions
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">7. Service Availability</h2>
            <p>
              We do not guarantee uninterrupted access. The system may be temporarily unavailable
              due to maintenance or technical issues.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">8. Limitation of Liability</h2>
            <p>
              INARI System is not liable for any indirect, incidental, or consequential damages
              arising from the use of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">9. Termination</h2>
            <p>
              We may suspend or terminate your account if you violate these terms or misuse the system.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">10. Changes to Terms</h2>
            <p>
              We may update these Terms at any time. Continued use of the system means you accept the changes.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">11. Contact</h2>
            <p>
              For questions, contact:{" "}
              <span className="text-blue-400">support@inari-system.com</span>
            </p>
          </div>

        </section>
      </div>
    </div>
  );
};

export default Terms;