import { Navigate, Route, Routes } from "react-router-dom";
import MobileShell from "@/components/common/MobileShell";

import HomeMapPage from "@/pages/home/HomeMapPage";
import RoomDetailPage from "@/pages/home/RoomDetailPage";
import ReservePage from "@/pages/reserve/ReservePage";
import CommunityPage from "@/pages/community/CommunityPage";
import MyPage from "@/pages/my/MyPage";

function App() {
    return (
        <MobileShell>
            <Routes>
                <Route path="/" element={<Navigate to="/home" replace />} />

                <Route path="/home" element={<HomeMapPage />} />
                <Route path="/home/rooms/:roomId" element={<RoomDetailPage />} />

                <Route path="/reserve" element={<ReservePage />} />
                <Route path="/community" element={<CommunityPage />} />
                <Route path="/my" element={<MyPage />} />

                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </MobileShell>
    );
}

export default App;