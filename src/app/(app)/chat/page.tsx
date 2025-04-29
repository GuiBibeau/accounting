'use client';

import * as React from 'react'; 
import Image from 'next/image';
import { SiteHeader } from '@/components/site-header'; 
import { LandingChatInput } from './LandingChatInput';

export default function Home() {
  return (
    <> 
      <SiteHeader title="Chat" /> 
      <div className="flex-1 overflow-hidden flex flex-col">
        <main className="max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1 overflow-auto">

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
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                    </svg>
                  ),
                  text: 'Draft Blog Post',
                  mobileText: 'Blog',
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
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                  ),
                  text: 'Analyze Community',
                  mobileText: 'Community',
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
                      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" x2="12" y1="19" y2="22"></line>
                    </svg>
                  ),
                  text: 'Plan Conference Talk',
                  mobileText: 'Talk',
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
                      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                    </svg>
                  ),
                  text: 'Generate Release Notes',
                  mobileText: 'Release',
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
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                      <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                      <path d="M9 18v-6"></path>
                      <path d="m15 12-6 6"></path>
                      <path d="m15 18-6-6"></path>
                    </svg>
                  ),
                  text: 'Check GitHub Issues',
                  mobileText: 'Issues',
                },
              ].map((button, index) => (
                <button
                  key={index}
                  className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1 sm:py-1.5 rounded-full border border-border bg-secondary text-secondary-foreground text-xs sm:text-sm hover:bg-secondary/80 hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all"
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
              <button className="flex items-center gap-2 px-4 sm:px-6 py-1.5 sm:py-2 rounded-full bg-secondary text-secondary-foreground text-xs sm:text-sm hover:bg-secondary/80">
                <span className="hidden sm:inline">
                  Draft a tweet about the latest feature release
                </span>
                <span className="sm:hidden">Draft feature tweet</span>
              </button>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {[
                {
                  src: '/next.svg',
                  alt: 'Developer documentation',
                  title: 'Improving Developer Documentation: Best Practices',
                },
                {
                  src: '/vercel.svg',
                  alt: 'Community engagement',
                  title: 'Engaging Your Developer Community Effectively',
                },
                {
                  src: '/globe.svg',
                  alt: 'Conference speaking',
                  title: 'Speaking at Tech Conferences: A Practical Guide',
                },
                {
                  src: '/window.svg',
                  alt: 'Developer relations metrics',
                  title: 'Measuring DevRel Impact: Key Metrics to Track',
                },
              ].map((card, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden border border-border bg-card hover:-translate-y-2 hover:shadow-lg transition-all"
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
    </>
  );
}
