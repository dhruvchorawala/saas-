'use client';
import { HelpCircle, ChevronDown, MessageCircle, FileText, Settings, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function HelpAndFaqPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: "How do price drop alerts work?",
      answer: "When you track a product, our intelligence engine monitors its price across multiple e-commerce platforms 24/7. Once the price drops below your set threshold, we instantly send you an email or push notification."
    },
    {
      question: "Which e-commerce stores are supported?",
      answer: "We currently support over 50 major retailers including Amazon, Flipkart, Myntra, Croma, and Reliance Digital. We are constantly expanding our supported stores to give you the best deals."
    },
    {
      question: "Can I import a wishlist from Amazon?",
      answer: "Yes! You can use our 'Add via URL' feature to track any product directly. Bulk importing from wishlists is a premium feature currently in beta testing."
    },
    {
      question: "How accurate is the availability tracking?",
      answer: "Extremely accurate. We ping retailer servers at optimized intervals to check inventory levels. If an out-of-stock product returns, you'll be notified within minutes."
    },
    {
      question: "Is there a limit to how many products I can track?",
      answer: "Free users can track up to 25 products simultaneously. Pro users enjoy unlimited product tracking and priority alert delivery."
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Help & Support</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Get answers, read guides, and contact our team.</p>
          </div>
        </div>
        <button className="inline-flex items-center justify-center px-6 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold hover:bg-indigo-100 transition-all shadow-sm">
          <MessageCircle className="h-5 w-5 mr-2" />
          Contact Support
        </button>
      </div>

      {/* Support Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass rounded-2xl p-6 border border-white/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Documentation</h3>
          <p className="text-sm text-slate-500">Read our detailed guides on how to maximize your savings.</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-pink-600 group-hover:text-white transition-colors">
            <Settings className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Account Setup</h3>
          <p className="text-sm text-slate-500">Manage your profile, billing, and notification preferences.</p>
        </div>
        <div className="glass rounded-2xl p-6 border border-white/60 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">Trust & Safety</h3>
          <p className="text-sm text-slate-500">Learn how we protect your data and secure your account.</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="glass rounded-3xl p-8 sm:p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/60">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                openFaq === index ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200/60 bg-white/50 hover:bg-white'
              }`}
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between focus:outline-none"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
              >
                <span className="font-bold text-slate-900 text-left">{faq.question}</span>
                <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openFaq === index ? 'transform rotate-180' : ''}`} />
              </button>
              
              <div className={`px-6 overflow-hidden transition-all duration-300 ${openFaq === index ? 'max-h-40 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                <p className="text-slate-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
