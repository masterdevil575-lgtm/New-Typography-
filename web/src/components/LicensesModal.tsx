import React from 'react';
import { Shield, ExternalLink, X } from 'lucide-react';

interface LicensesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LICENSES = [
  {
    name: 'ffmpeg.wasm',
    license: 'LGPL-2.1 / GPL-2.0',
    description: 'WebAssembly port of FFmpeg for client-side audio/video processing and encoding.',
    url: 'https://github.com/ffmpegwasm/ffmpeg.wasm',
    text: 'Licensed under the GNU Lesser General Public License v2.1 or later. FFmpeg is a trademark of Fabrice Bellard, originator of the FFmpeg project.'
  },
  {
    name: 'Groq SDK & Whisper Turbo',
    license: 'Apache 2.0 / MIT',
    description: 'Groq client library for high-speed speech-to-text inference with whisper-large-v3-turbo.',
    url: 'https://groq.com',
    text: 'Copyright 2024 Groq, Inc. Licensed under the Apache License, Version 2.0 (the "License"). You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.'
  },
  {
    name: 'Google Fonts: Poppins & Inter',
    license: 'SIL Open Font License 1.1',
    description: 'Geometric sans-serif typography designed by Indian Type Foundry (Poppins) and Rasmus Andersson (Inter).',
    url: 'https://scripts.sil.org/OFL',
    text: 'This Font Software is licensed under the SIL Open Font License, Version 1.1. This license is available with a FAQ at: http://scripts.sil.org/OFL.'
  },
  {
    name: 'React & React DOM',
    license: 'MIT License',
    description: 'A JavaScript library for building user interfaces.',
    url: 'https://reactjs.org',
    text: 'Copyright (c) Meta Platforms, Inc. and affiliates. Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files.'
  },
  {
    name: 'Lucide Icons',
    license: 'ISC License',
    description: 'Beautiful & consistent icon toolkit made by the Lucide community.',
    url: 'https://lucide.dev',
    text: 'Copyright (c) for portions of Lucide are held by Cole Bemis 2013-2022 as part of Feather. All other copyright (c) 2022-present Lucide contributors.'
  },
  {
    name: 'Tailwind CSS',
    license: 'MIT License',
    description: 'A utility-first CSS framework for rapid UI development.',
    url: 'https://tailwindcss.com',
    text: 'Copyright (c) Tailwind Labs, Inc. Permission is hereby granted, free of charge, to any person obtaining a copy.'
  }
];

export const LicensesModal: React.FC<LicensesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-[#0F1A16] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#14261F] text-[#1FD67A] flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-heading font-bold text-white">Open Source Licenses</h3>
              <p className="text-[11px] text-gray-400">Software & asset attributions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/[0.05] hover:bg-white/[0.1] flex items-center justify-center text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 space-y-3 overflow-y-auto pr-1">
          {LICENSES.map((lic, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#0A120F] border border-white/[0.06] space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{lic.name}</span>
                <span className="px-2 py-0.5 rounded-md bg-[#1FD67A]/15 text-[#1FD67A] text-[9px] font-bold">
                  {lic.license}
                </span>
              </div>
              <p className="text-[11px] text-gray-400">{lic.description}</p>
              <p className="text-[10px] text-gray-400 font-mono pt-1 leading-relaxed border-t border-white/[0.04]">
                {lic.text}
              </p>
              <div className="pt-1">
                <a
                  href={lic.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1 text-[10px] text-[#1FD67A] hover:underline"
                >
                  <span>Project Homepage</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
