'use client';

import { useRouter } from 'next/navigation';

// This is a client component because it uses onClick and useRouter.
export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    // Call the logout API route
    const response = await fetch('/api/auth/logout', { method: 'POST' });

    if (response.ok) {
      // If the API call is successful, redirect to the login page.
      router.push('/login');
    } else {
      alert('Logout failed. Please try again.');
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors duration-200"
    >
      Logout
    </button>
  );
}
