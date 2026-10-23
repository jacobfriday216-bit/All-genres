import React, { useState } from 'react';
import {
  ArrowLeft,
  Mail,
  CheckCircle2,
  Shield,
  FileText,
  Info,
  AlertTriangle,
  Globe
} from 'lucide-react';

export type PolicyType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | null;

interface PolicyViewProps {
  type: PolicyType;
  onGoHome: () => void;
  contactEmail: string;
}

export const PolicyView: React.FC<PolicyViewProps> = ({ type, onGoHome, contactEmail }) => {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSubject, setFormSubject] = useState('');
  const [formMessage, setFormMessage] = useState('');

  if (!type) return null;

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setFormName('');
      setFormEmail('');
      setFormSubject('');
      setFormMessage('');
    }, 1500);
  };

  const getTitle = () => {
    switch (type) {
      case 'about':
        return 'About ALL GENRES Magazine';
      case 'contact':
        return 'Contact the Editorial Desk';
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms and Conditions';
      case 'disclaimer':
        return 'Editorial & Advertising Disclaimer';
    }
  };

  const getSubtitle = () => {
    switch (type) {
      case 'about':
        return 'Our mission, editorial standards, and international media coverage.';
      case 'contact':
        return 'Reach out for press inquiries, music submissions, artist interviews, and partnerships.';
      case 'privacy':
        return 'How we safeguard visitor privacy, cookies, and digital transparency.';
      case 'terms':
        return 'Terms of use governing all visitors, subscribers, and contributors.';
      case 'disclaimer':
        return 'Important editorial disclosures, affiliate advertising notices, and copyright rights.';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'about':
        return <Info className="w-5 h-5 text-amber-500" />;
      case 'contact':
        return <Mail className="w-5 h-5 text-red-500" />;
      case 'privacy':
        return <Shield className="w-5 h-5 text-blue-500" />;
      case 'terms':
        return <FileText className="w-5 h-5 text-purple-500" />;
      case 'disclaimer':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 w-full bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3 shadow-md">
        <button
          type="button"
          onClick={onGoHome}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-zinc-200 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
            {getTitle()}
          </span>
        </div>

        <button
          type="button"
          onClick={onGoHome}
          className="text-xs text-zinc-400 hover:text-white hidden sm:block"
        >
          Close
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
        {/* Header Hero */}
        <div className="border-b border-zinc-800 pb-6 mb-8">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-500 mb-2">
            <span>ALL GENRES</span>
            <span>·</span>
            <span className="text-zinc-400">Official Information</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">
            {getTitle()}
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 mt-2">
            {getSubtitle()}
          </p>
        </div>

        {/* Content Body */}
        <div className="space-y-6 text-sm sm:text-base text-zinc-300 leading-relaxed font-sans">
          {type === 'about' && (
            <div className="space-y-6">
              <p className="text-lg text-zinc-100 font-medium leading-relaxed">
                <strong>ALL GENRES</strong> is an authoritative, global entertainment news
                publication dedicated to documenting the vibrant pulse of music, cinema, and popular
                culture across Africa, Hollywood, Nollywood, and international stages.
              </p>

              <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-2">
                <h3 className="text-base font-bold text-white">Our Editorial Mission</h3>
                <p className="text-zinc-400 text-sm">
                  From sold-out stadium concerts headlined by Afrobeats pioneers like Burna Boy,
                  Wizkid, and Davido, to red-carpet premieres in Lagos, London, and Los Angeles, we
                  celebrate the musicians, actors, directors, and cultural creators who shape modern
                  entertainment.
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Coverage Domains</h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-zinc-300">
                  <li className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <strong className="text-red-400 block mb-0.5">Music & Musicians</strong>
                    Album launches, global tours, Afrobeats, hip-hop, pop, and chart milestones.
                  </li>
                  <li className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <strong className="text-amber-400 block mb-0.5">Movies & Actors</strong>
                    Box office updates, film reviews, cast announcements, and celebrity spotlights.
                  </li>
                  <li className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <strong className="text-emerald-400 block mb-0.5">Nollywood Spotlight</strong>
                    West Africa's booming cinema industry, top streaming hits, and directing talent.
                  </li>
                  <li className="p-3 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <strong className="text-blue-400 block mb-0.5">Hollywood & Awards</strong>
                    The Oscars, Golden Globes, Grammys, Cannes, and major festival insights.
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-bold text-white">Editorial Independence</h3>
                <p>
                  Our team of dedicated entertainment journalists upholds strict accuracy and
                  objectivity. We prioritize authentic storytelling, verifiable facts, and respectful
                  representation of the global creative community.
                </p>
              </div>
            </div>
          )}

          {type === 'contact' && (
            <div className="space-y-6">
              {contactSubmitted ? (
                <div className="py-12 text-center space-y-4 p-8 rounded-3xl bg-zinc-900 border border-zinc-800 shadow-xl">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <h3 className="text-2xl font-black text-white">Inquiry Successfully Sent!</h3>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto">
                    Thank you for reaching out to the ALL GENRES editorial desk. Our communications
                    team has received your submission and will review it promptly.
                  </p>
                  <button
                    type="button"
                    onClick={() => setContactSubmitted(false)}
                    className="mt-4 px-6 py-2.5 bg-red-600 hover:bg-red-500 text-xs font-bold uppercase tracking-wider rounded-xl text-white transition-all cursor-pointer shadow-lg"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  <div className="md:col-span-5 space-y-4">
                    <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                        Direct Editorial Desk
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Have a breaking entertainment story, music premiere, press release, or
                        advertising inquiry? Reach out directly via our official communication
                        channels:
                      </p>
                      <div className="pt-2 border-t border-zinc-800 text-xs space-y-1.5">
                        <p className="text-zinc-400">
                          Email:{' '}
                          <a
                            href={`mailto:${contactEmail}`}
                            className="text-amber-400 font-bold hover:underline"
                          >
                            {contactEmail}
                          </a>
                        </p>
                        <p className="text-zinc-400">
                          Response time:{' '}
                          <span className="text-emerald-400 font-semibold">24 to 48 hours</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-7">
                    <form
                      onSubmit={handleContactSubmit}
                      className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-4 shadow-xl"
                    >
                      <h3 className="text-base font-bold text-white uppercase tracking-wider">
                        Send a Message to Editors
                      </h3>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                          Your Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder="e.g. Adeola Benson"
                          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                          Your Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="adeola@example.com"
                          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                          Subject / Topic *
                        </label>
                        <input
                          type="text"
                          required
                          value={formSubject}
                          onChange={(e) => setFormSubject(e.target.value)}
                          placeholder="e.g. Press Release: New Music Album Premiere"
                          className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-zinc-300 mb-1.5">
                          Message Details *
                        </label>
                        <textarea
                          required
                          rows={5}
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="Provide details about your inquiry, music track link, or interview request..."
                          className="w-full p-3.5 bg-zinc-950 border border-zinc-700 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-y"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
                      >
                        Submit Editorial Inquiry
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-5">
              <p>
                At <strong>ALL GENRES</strong>, we respect the digital privacy of our visitors. This
                Privacy Policy outlines the types of personal information received and collected by
                ALL GENRES and how it is used.
              </p>

              <h3 className="text-base font-bold text-white pt-2">1. Information Collection</h3>
              <p>
                We do not collect personal data from visitors browsing our public news feeds unless
                voluntarily provided via our contact forms or visitor registration portal. Standard web
                server logs record anonymous technical parameters such as browser type, operating
                system, and referral pages.
              </p>

              <h3 className="text-base font-bold text-white pt-2">2. Cookies & Advertising Partners</h3>
              <p>
                ALL GENRES works with third-party digital advertising networks including Monetag and
                Google. These partners may use cookies and web beacons to serve contextually relevant
                advertisements based on prior visits to our site. Visitors may manage or disable
                cookies via their browser settings at any time.
              </p>

              <h3 className="text-base font-bold text-white pt-2">3. Data Protection</h3>
              <p>
                We employ industry-standard encryption protocols (HTTPS/TLS) and secure token
                authentication to prevent unauthorized access or disclosure of member account data.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-5">
              <p>
                Welcome to <strong>ALL GENRES</strong>. By accessing this website, you agree to comply
                with and be bound by the following terms and conditions of use.
              </p>

              <h3 className="text-base font-bold text-white pt-2">1. Intellectual Property</h3>
              <p>
                All original articles, editorial commentary, logos, graphics, and layout designs
                published on ALL GENRES are the intellectual property of ALL GENRES and its content
                creators. Reproduction or redistribution without written permission is strictly
                prohibited.
              </p>

              <h3 className="text-base font-bold text-white pt-2">2. User Conduct</h3>
              <p>
                Comments and interactive features must remain respectful, free of harassment,
                defamation, or spam. The ALL GENRES moderation team reserves the right to remove any
                inappropriate comments or suspend accounts violating these standards.
              </p>
            </div>
          )}

          {type === 'disclaimer' && (
            <div className="space-y-5">
              <p>
                The information provided on <strong>ALL GENRES</strong> is for general entertainment,
                educational, and news informational purposes only.
              </p>

              <h3 className="text-base font-bold text-white pt-2">Editorial Accuracy</h3>
              <p>
                While our journalists endeavor to verify all celebrity quotes, music release dates,
                and cinema records, ALL GENRES makes no representations or warranties of any kind
                regarding the completeness, accuracy, or suitability of information presented.
              </p>

              <h3 className="text-base font-bold text-white pt-2">Third-Party Links & Advertising</h3>
              <p>
                Our publication may include advertising banners, sponsored partner links, or pop-up
                redirects provided by advertising platforms like Monetag. ALL GENRES does not endorse
                or assume responsibility for the content, privacy policies, or practices of third-party
                websites.
              </p>
            </div>
          )}
        </div>

        {/* Bottom Back Button */}
        <div className="mt-12 pt-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to ALL GENRES Home</span>
          </button>
        </div>
      </main>
    </div>
  );
};
