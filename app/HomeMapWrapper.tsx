'use client';

import dynamic from 'next/dynamic';

const HomeMap = dynamic(() => import('./HomeMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-80 rounded-xl flex flex-col items-center justify-center bg-blue-50/60 border border-blue-100">
      <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
      <p className="text-sm font-medium text-gray-500">Loading civic issue map…</p>
    </div>
  ),
});

export default function HomeMapWrapper() {
  return <HomeMap />;
}
