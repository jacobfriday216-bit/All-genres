import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Shield, FileText, Info, AlertTriangle } from 'lucide-react';

export type PolicyType = 'about' | 'contact' | 'privacy' | 'terms' | 'disclaimer' | null;

interface PolicyModalProps {
  type: PolicyType;
  onClose: () => void;
  contactEmail: string;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ type, onClose, contactEmail }) => {
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
    }, 1000);
  };

  const getTitle = () => {
    switch (type) {
      case 'about':
        return 'About ALL GENRES';
      case 'contact':
        return 'Contact Editorial Team';
      case 'privacy':
        return 'Privacy Policy';
      case 'terms':
        return 'Terms and Conditions';
      case 'disclaimer':
        return 'Editorial & Advertising Disclaimer';
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-950">
          <div className="flex items-center gap-2.5">
            {getIcon()}
            <h3 className="text-lg font-bold text-white">{getTitle()}</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-sm text-zinc-300 leading-relaxed">
          {type === 'about' && (
            <div className="space-y-4">
              <p className="text-base text-zinc-100 font-medium leading-relaxed">
                <strong>ALL GENRES</strong> is an authoritative, global entertainment news
                publication dedicated to documenting the vibrant pulse of music, cinema, and popular
                culture across Africa, Hollywood, and international stages.
              </p>
              <h4 className="text-base font-bold text-white pt-2">Our Mission</h4>
              <p>
                From sold-out stadium concerts headlined by Afrobeats pioneers to red-carpet
                premieres in Lagos and Los Angeles, we celebrate artists, musicians, filmmakers,
                and cultural visionaries who break creative boundaries.
              </p>
              <h4 className="text-base font-bold text-white pt-2">Editorial Independence</h4>
              <p>
                Our team of dedicated journalists and cultural critics uphold strict journalistic
                integrity. We champion diversity, authentic reporting, and rich storytelling across
                every creative genre.
              </p>
            </div>
          )}

          {type === 'contact' && (
            <div>
              {contactSubmitted ? (
                <div className="py-8 text-center space-y-3">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                  <h4 className="text-lg font-bold text-white">Message Received!</h4>
                  <p className="text-sm text-zinc-400 max-w-md mx-auto">
                    Thank you for reaching out to the ALL GENRES editorial desk. Our communications
                    team will review your inquiry and respond to your email.
                  </p>
                  <button
                    onClick={() => setContactSubmitted(false)}
                    className="mt-4 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold rounded-lg text-white"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <p className="text-xs text-zinc-400">
                    Press inquiries, music submissions, interview requests, and advertising
                    proposals can be submitted directly through this desk or sent to{' '}
                    <strong className="text-amber-400">{contactEmail}</strong>.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Adeola Benson"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Your Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Subject / Topic
                    </label>
                    <input
                      type="text"
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="e.g. Press Release: New Music Video Debut"
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1">
                      Message Details
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formMessage}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Share your press kit, query, or advertising interest..."
                      className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-red-500 resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-md"
                  >
                    Submit Editorial Inquiry
                  </button>
                </form>
              )}
            </div>
          )}

          {type === 'privacy' && (
            <div className="space-y-3">
              <p>
                At ALL GENRES, we respect the digital privacy of our visitors. This Privacy Policy
                explains our policies regarding information collection and usage across our online
                platforms.
              </p>
              <h4 className="text-white font-bold">1. Information We Collect</h4>
              <p>
                We do not require account registration to read our published entertainment articles.
                When visitors opt into user registration or leave comments, we collect basic details
                such as your name and email address.
              </p>
              <h4 className="text-white font-bold">2. Advertising & Cookies</h4>
              <p>
                We collaborate with authorized third-party advertising networks (including Monetag)
                who may serve targeted advertisements and promotional content based on user visits
                to our website and other internet properties.
              </p>
              <h4 className="text-white font-bold">3. Contact</h4>
              <p>
                Questions regarding our privacy practices may be addressed to{' '}
                <span className="text-amber-400">{contactEmail}</span>.
              </p>
            </div>
          )}

          {type === 'terms' && (
            <div className="space-y-3">
              <p>
                By accessing ALL GENRES, you agree to comply with and be bound by the following
                terms and conditions of usage.
              </p>
              <h4 className="text-white font-bold">1. Copyright & Intellectual Property</h4>
              <p>
                All original articles, editorial commentary, and media produced by ALL GENRES are
                protected by copyright law. Syndication or republication requires explicit written
                attribution.
              </p>
              <h4 className="text-white font-bold">2. User Conduct & Reader Discussions</h4>
              <p>
                Readers are welcome to contribute comments and reactions. Hate speech, defamation,
                or unauthorized commercial spam will be moderated or removed by our editorial team.
              </p>
            </div>
          )}

          {type === 'disclaimer' && (
            <div className="space-y-3">
              <p>
                The materials and reporting provided on ALL GENRES are for general entertainment,
                cultural commentary, and informational purposes.
              </p>
              <h4 className="text-white font-bold">Third-Party Links & Advertising</h4>
              <p>
                ALL GENRES may display commercial advertisements, partner pop-ups, and sponsored
                links provided by Monetag and third-party monetization networks. We are not
                responsible for external website content or third-party transactions.
              </p>
              <h4 className="text-white font-bold">Celebrity Profiles</h4>
              <p>
                Celebrity biographies, net worth estimates, and industry box office figures are
                compiled using reputable news agencies, box office trackers, and public records.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-zinc-950 border-t border-zinc-800 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
