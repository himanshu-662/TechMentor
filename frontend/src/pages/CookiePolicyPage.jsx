import React from 'react';
import {
  Brain,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowRight,
  Cookie,
  Lock,
  EyeOff,
  CheckCircle2,
  Database,
  RefreshCw,
  HardDrive
} from 'lucide-react';
import Badge from '../components/common/Badge';
import TechMentorNav from '../components/navigation/TechMentorNav';
import TechMentorFooter from '../components/navigation/TechMentorFooter';

export const CookiePolicyPage = ({ onNavigate, onLaunchStudio }) => {
  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden relative selection:bg-brand-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-brand-500/15 via-purple-500/10 to-transparent blur-3xl opacity-70" />
        <div className="absolute top-[40%] -left-60 w-[600px] h-[600px] bg-cyan-500/10 blur-3xl rounded-full" />
        <div className="absolute top-[70%] -right-60 w-[600px] h-[600px] bg-emerald-500/10 blur-3xl rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* Unified Ecosystem Header */}
      <TechMentorNav currentSuite="ecosystem" onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <Badge variant="brand" className="mb-3">Legal & Compliance</Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Cookie & Storage Policy
          </h1>
          <p className="text-slate-400 mt-4 text-xs sm:text-sm">
            Last Updated: October 2026 • Compliant with GDPR, ePrivacy Directive & CCPA
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="p-6 rounded-2xl bg-brand-950/20 border border-brand-500/30 mb-12 flex items-start gap-4">
          <Cookie className="w-6 h-6 text-brand-400 shrink-0 mt-1" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Zero Third-Party Tracking Cookies Guarantee</h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              TechMentor (including DataMentor, AIMentor, and Menti.ai) does not employ third-party advertising trackers, cross-site beacons, or data broker cookies. All client-side storage is strictly functional to maintain your active dataset state and UI theme preferences.
            </p>
          </div>
        </div>

        <div className="space-y-10 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="font-mono text-brand-400">1.</span> What Are Cookies and Local Storage?
            </h2>
            <p className="text-slate-400">
              Cookies and web storage technologies (such as HTML5 LocalStorage and SessionStorage) are small text files or key-value data stores saved on your device when you visit web applications. They allow the browser to retain your interactive state across reloads.
            </p>
          </section>

          {/* Section 2: Storage Categories */}
          <section className="space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="font-mono text-brand-400">2.</span> How TechMentor Uses Storage
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                  <HardDrive className="w-4 h-4 text-emerald-400" />
                  <span>Essential Session State (LocalStorage)</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Stores your active dataset ID, current pipeline step index (1–13), and sidebar toggle status so you can refresh the page without losing your place in DataMentor.
                </p>
                <div className="text-[11px] font-mono text-emerald-400 pt-2 border-t border-slate-850">
                  Storage Type: Strictly Necessary (Exempt from consent banners)
                </div>
              </div>

              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 font-bold text-white text-xs sm:text-sm">
                  <EyeOff className="w-4 h-4 text-brand-400" />
                  <span>Zero Marketing or Ad Cookies</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We do not embed Facebook Pixel, Google Ads, affiliate trackers, or fingerprinting scripts. We do not sell your browsing patterns to advertisers.
                </p>
                <div className="text-[11px] font-mono text-brand-400 pt-2 border-t border-slate-850">
                  Storage Type: None / Not Applicable
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Storage Breakdown Table */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="font-mono text-brand-400">3.</span> Inventory of Local Storage Keys
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950">
                    <th className="p-3.5 font-bold text-white">Key Name</th>
                    <th className="p-3.5 font-bold text-white">Purpose</th>
                    <th className="p-3.5 font-bold text-white">Duration</th>
                    <th className="p-3.5 font-bold text-white">Category</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-400 font-mono text-[11px]">
                  <tr>
                    <td className="p-3.5 text-brand-300">datamentor_active_step</td>
                    <td className="p-3.5 text-slate-300 font-sans">Preserves current pipeline stage in DataMentor Studio</td>
                    <td className="p-3.5">Session / Persistent</td>
                    <td className="p-3.5 text-emerald-400">Essential</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-brand-300">datamentor_theme</td>
                    <td className="p-3.5 text-slate-300 font-sans">Retains dark UI configuration and color tokens</td>
                    <td className="p-3.5">1 Year</td>
                    <td className="p-3.5 text-emerald-400">Functional</td>
                  </tr>
                  <tr>
                    <td className="p-3.5 text-brand-300">datamentor_dataset_id</td>
                    <td className="p-3.5 text-slate-300 font-sans">Identifier of in-memory active dataset session</td>
                    <td className="p-3.5">Session</td>
                    <td className="p-3.5 text-emerald-400">Essential</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 4: How to Manage and Clear */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="font-mono text-brand-400">4.</span> Clearing and Disabling Storage
            </h2>
            <p className="text-slate-400">
              You have full control over data stored in your browser. You can clear local storage or block cookies at any time via your browser settings:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-400 ml-2">
              <li><strong className="text-slate-300">Chrome:</strong> Settings → Privacy & Security → Clear browsing data → Cookies and site data.</li>
              <li><strong className="text-slate-300">Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data → Clear Data.</li>
              <li><strong className="text-slate-300">Safari:</strong> Preferences → Privacy → Manage Website Data → Remove All.</li>
            </ul>
            <p className="text-xs text-slate-500 mt-2">
              * Note: Clearing LocalStorage will reset your active workspace view to Step 01 Data Collection.
            </p>
          </section>

          {/* Section 5: Contact */}
          <section className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="font-mono text-brand-400">5.</span> Privacy Inquiries
            </h2>
            <p className="text-slate-400">
              For any questions regarding our storage practices or GDPR compliance, please visit our{' '}
              <button onClick={() => onNavigate && onNavigate('contact')} className="text-brand-400 hover:underline">
                Contact Page
              </button>{' '}
              or review our{' '}
              <button onClick={() => onNavigate && onNavigate('privacy')} className="text-brand-400 hover:underline">
                Privacy Policy
              </button>.
            </p>
          </section>
        </div>
      </main>

      {/* Unified Ecosystem Footer */}
      <TechMentorFooter onNavigate={onNavigate} onLaunchStudio={onLaunchStudio} />
    </div>
  );
};

export default CookiePolicyPage;
