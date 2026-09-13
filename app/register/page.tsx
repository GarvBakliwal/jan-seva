import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegisterForm from './RegisterForm';

export const metadata: Metadata = { title: 'Register' };

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4" style={{ background: 'var(--gray-50)' }}>
        <div className="w-full max-w-md">
          <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-md)' }}>
            <div className="text-center mb-6">
              <Image src="/images/jan-seva-official-seal.svg" alt="Jan Seva official seal" width={64} height={64} className="w-16 h-16 mx-auto mb-3" priority />
              <h1 className="text-xl font-bold" style={{ color: 'var(--gov-navy)' }}>
                Create Your Account
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--gray-500)' }}>
                Register to report civic issues in your area
              </p>
            </div>

            <RegisterForm />
          </div>

          <p className="text-center text-sm mt-4" style={{ color: 'var(--gray-600)' }}>
            Already have an account?{' '}
            <a href="/login" className="font-semibold" style={{ color: 'var(--gov-blue)' }}>
              Sign in here
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
