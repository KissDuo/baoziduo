import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary-600">
            EnglishHub
          </Link>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
