import { Type, Globe } from 'lucide-react'
import React, { useState } from 'react'

const UtilityHeader = () => {
    const [lang, setLang] = useState<'en' | 'hi'>('en');
    const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
    return (
        <header className="gov-header" role="banner">
            {/* Top bar with Govt branding and Accessibility Controls */}
            <div className="gov-top-bar">
                <div className="container-gov flex items-center justify-between py-1 text-xs">
                    <div className="flex items-center gap-2">
                        {/* Indian Flag Tricolor Icon */}
                        <div className="inline-flex items-center gap-1.5 font-medium text-white/90">
                            <span className="inline-flex flex-col w-4 h-3 rounded-sm overflow-hidden border border-white/20">
                                <span className="h-1 bg-[#FF9933]"></span>
                                <span className="h-1 bg-white"></span>
                                <span className="h-1 bg-[#138808]"></span>
                            </span>
                            <span className="font-semibold text-white tracking-wide">GOVERNMENT OF INDIA</span>
                            <span className="text-white/40">|</span>
                            <span className="text-white/80">Digital India</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-white/80">
                        {/* Font size accessibility */}
                        <div className="hidden sm:flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded text-[11px]">
                            <Type size={12} className="text-white/60 mr-0.5" />
                            <button
                                onClick={() => setFontSize('normal')}
                                className={`px-1 hover:text-white ${fontSize === 'normal' ? 'font-bold text-white underline' : ''}`}
                                title="Normal text size"
                            >
                                A-
                            </button>
                            <button
                                onClick={() => setFontSize('large')}
                                className={`px-1 hover:text-white ${fontSize === 'large' ? 'font-bold text-white underline' : ''}`}
                                title="Large text size"
                            >
                                A
                            </button>
                            <button
                                onClick={() => setFontSize('xlarge')}
                                className={`px-1 hover:text-white ${fontSize === 'xlarge' ? 'font-bold text-white underline' : ''}`}
                                title="Extra large text size"
                            >
                                A+
                            </button>
                        </div>

                        <span className="hidden sm:inline text-white/30">|</span>

                        {/* Language toggle */}
                        <div className="flex items-center gap-1 text-xs">
                            <Globe size={12} className="text-white/60" />
                            <button
                                onClick={() => setLang('hi')}
                                className={`hover:text-white ${lang === 'hi' ? 'font-bold text-white underline' : 'text-white/70'}`}
                            >
                                हिन्दी
                            </button>
                            <span className="text-white/30">|</span>
                            <button
                                onClick={() => setLang('en')}
                                className={`hover:text-white ${lang === 'en' ? 'font-bold text-white underline' : 'text-white/70'}`}
                            >
                                English
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default UtilityHeader