import { Navigate, Route, Routes } from 'react-router-dom';
import MobileShell from '@/components/common/MobileShell';
import ScrollToTop from '@/components/common/ScrollToTop'; // ✅ 추가

import HomeMapPage from '@/pages/home/HomeMapPage';
import RoomDetailPage from '@/pages/home/RoomDetailPage';
import ReservePage from '@/pages/reserve/ReservePage';
import PaymentPage from '@/pages/payment/PaymentPage';
import MyPage from '@/pages/my/MyPage';

function App() {
  return (
    <MobileShell>
      <ScrollToTop /> {/* ✅ 페이지 이동 시 무조건 스크롤 최상단으로 */}
      <Routes>
        <Route path='/' element={<Navigate to='/home' replace />} />

        <Route path='/home' element={<HomeMapPage />} />
        <Route path='/home/rooms/:roomId' element={<RoomDetailPage />} />

        <Route path='/reserve' element={<ReservePage />} />
        <Route path='/payment' element={<PaymentPage />} />

        <Route path='/my' element={<MyPage />} />

        <Route path='*' element={<Navigate to='/home' replace />} />
      </Routes>
    </MobileShell>
  );
}

export default App;
