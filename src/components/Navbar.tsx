import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-purple-900 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-3xl font-bold text-white hover:text-orange-300 transition-colors">
            AFFILIFY
          </Link>
          <div className="flex space-x-6 items-center">
            <Link href="/" className="text-purple-200 hover:text-white hover:bg-purple-700 px-4 py-2 rounded-lg transition-all duration-300 font-semibold">Home</Link>
            <Link href="/about" className="text-purple-200 hover:text-white hover:bg-purple-700 px-4 py-2 rounded-lg transition-all duration-300 font-semibold">About</Link>
            <Link href="/features" className="text-purple-200 hover:text-white hover:bg-purple-700 px-4 py-2 rounded-lg transition-all duration-300 font-semibold">Features</Link>
            <Link href="/pricing" className="text-purple-200 hover:text-white hover:bg-purple-700 px-4 py-2 rounded-lg transition-all duration-300 font-semibold">Pricing</Link>
            <Link href="/docs" className="text-purple-200 hover:text-white hover:bg-purple-700 px-4 py-2 rounded-lg transition-all duration-300 font-semibold">Documentation</Link>
            <div className="flex space-x-3">
              <Link href="/login"><button className="text-purple-200 hover:text-white hover:bg-purple-700 px-6 py-2 rounded-lg transition-all duration-300 font-semibold hover:scale-105">Sign-in</button></Link>
              <Link href="/signup"><button className="text-purple-200 hover:text-white hover:bg-purple-700 px-6 py-2 rounded-lg transition-all duration-300 font-semibold hover:scale-105">Sign-up</button></Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
