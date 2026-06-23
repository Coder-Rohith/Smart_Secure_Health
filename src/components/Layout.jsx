/**
 * Layout — Main app layout with sidebar + animated content area.
 */

import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <div className="min-h-screen animated-bg grid-pattern">
      <Sidebar />
      <main className="ml-[260px] p-6 lg:p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
}
