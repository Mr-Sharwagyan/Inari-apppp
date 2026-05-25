import React from "react";

const SLA = () => {
  return (
    <div className="min-h-screen bg-gray-200 text-black px-6 py-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
          SLA Commitments
        </h1>
        <p className="text-sm text-slate-700 mb-10">
          Service Level Agreement – INARI System (May 2026)
        </p>

        {/* Content */}
        <section className="space-y-6 text-sm leading-6">

          <div>
            <h2 className="text-lg font-semibold text-black">1. System Uptime</h2>
            <p>
              INARI System aims to maintain a high level of availability with a target uptime of
              <span className="text-green-400 font-semibold"> 99%</span>.
              Scheduled maintenance may temporarily reduce availability.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">2. Performance</h2>
            <p>
              We strive to ensure fast and stable performance across the platform.
              Most requests should be processed within a few seconds under normal conditions.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">3. Support Response Time</h2>
            <p>
              Critical issues: within 24 hours  
              <br />
              General inquiries: within 48 hours  
              <br />
              Non-urgent requests: best effort basis
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">4. Maintenance</h2>
            <p>
              Planned maintenance will be announced in advance whenever possible.
              Emergency maintenance may occur without prior notice if required for system stability.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">5. Data Availability</h2>
            <p>
              We aim to ensure continuous access to user data. However, temporary disruptions
              may occur due to updates, technical issues, or external service dependencies.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">6. Limitations</h2>
            <p>
              SLA commitments do not cover issues caused by:
              <br />• User-side internet problems
              <br />• Third-party service failures
              <br />• Force majeure events (natural disasters, outages, etc.)
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">7. Updates to SLA</h2>
            <p>
              We may update these SLA commitments as the system evolves.
              Changes will be reflected on this page.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-black">8. Contact</h2>
            <p>
              For SLA-related concerns, contact:{" "}
              <span className="text-blue-400">support@inari-system.com</span>
            </p>
          </div>

        </section>
      </div>
    </div>
  );
};

export default SLA;