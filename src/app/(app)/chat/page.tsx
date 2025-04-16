'use client';

import Image from 'next/image';
import { Calculator } from 'lucide-react';

import { LandingChatInput } from './LandingChatInput';

export default function Home() {
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1 overflow-auto">
            <h1 className="text-2xl sm:text-3xl font-semibold text-center text-blue-300 mb-6 sm:mb-8 flex items-center justify-center">
              Aiccountant
              <Calculator className="w-5 h-5 ml-2 text-blue-300" />
            </h1>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-6">
              {[
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 9h18" />
                      <path d="M9 21V9" />
                    </svg>
                  ),
                  text: 'Generate Timesheet',
                  mobileText: 'Timesheet',
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <path d="M21 14H3" />
                      <path d="M21 9H3" />
                      <path d="M21 4H3" />
                      <path d="M21 19H3" />
                    </svg>
                  ),
                  text: 'Send Invoice',
                  mobileText: 'Invoice',
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <circle cx="8" cy="21" r="1" />
                      <circle cx="19" cy="21" r="1" />
                      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                    </svg>
                  ),
                  text: 'View Payables',
                  mobileText: 'Payables',
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <path d="M12 2v20" />
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                    </svg>
                  ),
                  text: 'Track Expenses',
                  mobileText: 'Expenses',
                },
                {
                  icon: (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3 h-3 sm:w-4 sm:h-4"
                    >
                      <rect width="20" height="14" x="2" y="5" rx="2" />
                      <line x1="2" x2="22" y1="10" y2="10" />
                    </svg>
                  ),
                  text: 'Run Payroll',
                  mobileText: 'Payroll',
                },
              ].map((button, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full border border-gray-700 bg-[#333] text-xs sm:text-sm hover:bg-[#444] hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
                >
                  {button.icon}
                  <span className="hidden xs:inline">{button.text}</span>
                  <span className="xs:hidden">{button.mobileText}</span>
                </button>
              ))}
            </div>

            {/* Input Area */}
            <LandingChatInput />

            {/* Suggestion */}
            <div className="flex justify-center mb-8 sm:mb-12">
              <button className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-[#333] text-xs sm:text-sm">
                <span className="hidden sm:inline">
                  Create an invoice for my latest client project
                </span>
                <span className="sm:hidden">Create an invoice for client</span>
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  src: '/financial-overview-dashboard.png',
                  alt: 'Financial planning dashboard',
                  title:
                    'Business Cash Flow Management: Optimizing Working Capital',
                },
                {
                  src: '/tax-documents-organized.png',
                  alt: 'Tax preparation documents',
                  title: 'Small Business Tax Strategies: Maximizing Deductions',
                },
                {
                  src: '/growth-strategy-overview.png',
                  alt: 'Investment portfolio analysis',
                  title:
                    'Inventory Management: Reducing Costs While Meeting Demand',
                },
                {
                  src: '/retirement-planning-abstract.png',
                  alt: 'Retirement planning calculator',
                  title:
                    'Employee Benefits Analysis: Balancing Costs and Retention',
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden border border-gray-800 bg-[#222] hover:-translate-y-2 hover:shadow-lg hover:border-gray-600 transition-all"
                >
                  <div className="relative h-40 sm:h-48">
                    <Image
                      src={card.src || '/placeholder.svg'}
                      alt={card.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-medium text-sm sm:text-base">
                      {card.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
      </main>
    </div>
  );
}
