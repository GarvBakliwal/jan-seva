import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Login' };

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4" style={{ background: 'var(--gray-50)' }}>
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            {/* Brand */}
            <div className="text-center mb-6">
              <Image src="/images/jan-seva-official-seal.svg" alt="Jan Seva official seal" width={64} height={64} className="w-16 h-16 mx-auto mb-3" priority />
              <h1 className="text-xl font-bold" style={{ color: 'var(--gov-navy)' }}>
                Sign in to Jan Seva
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
                जन सेवा — Civic Issue Reporting Portal
              </p>
            </div>

            <Suspense fallback={<div className="py-8 text-center text-sm text-gray-500">Loading login form...</div>}>
              <LoginForm />
            </Suspense>
          </div>


          <p className="text-center text-sm mt-4" style={{ color: 'var(--gray-600)' }}>
            Don&apos;t have an account?{' '}
            <a href="/register" className="font-semibold" style={{ color: 'var(--gov-blue)' }}>
              Register here
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
