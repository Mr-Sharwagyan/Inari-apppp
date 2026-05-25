import React from "react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white text-black px-6 py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-400 mb-10">
          Effective Date: May 2026 – INARI System
        </p>

        {/* Section */}
        <section className="space-y-6 text-sm leading-6">

          <div>
            <h2 className="text-lg font-semibold text-black">1. Information We Collect</h2>
            <p>
              We collect personal details such as name, email, phone number, and address.
              We also collect usage data like system activity, device info, and IP address.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">2. How We Use Information</h2>
            <p>
              Your data is used to process orders, manage accounts, improve system performance,
              and send important notifications like order updates.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">3. Data Protection</h2>
            <p>
              We use secure systems to protect your data from unauthorized access, misuse, or loss.
              However, no digital system is 100% secure.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">4. Sharing of Information</h2>
            <p>
              We do not sell your data. We only share information with delivery partners,
              payment providers, or legal authorities when required.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">5. Cookies</h2>
            <p>
              We use cookies to improve user experience and analyze system usage.
              You can disable cookies in your browser settings.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">6. Your Rights</h2>
            <p>
              You can access, update, or delete your personal data anytime.
              You may also opt out of marketing messages.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">7. Third-Party Services</h2>
            <p>
              We may use third-party services like payment gateways. They have their own privacy policies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">8. Changes to Policy</h2>
            <p>
              We may update this policy anytime. Updates will be posted on this page.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">9. Contact</h2>
            <p>
              For questions, contact: <span className="text-blue-400">admin@inari.com</span>
            </p>
          </div>

        </section>
      </div>
    </div>
  );
};

export default Privacy;