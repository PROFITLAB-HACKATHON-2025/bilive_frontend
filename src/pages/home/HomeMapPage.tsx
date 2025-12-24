import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery } from "@tanstack/react-query";
import { fetchRooms } from "@/api/rooms.ts";
import { useAppStore } from "@/store/useAppStore.ts";

import { SearchBox, SearchField } from "@/components/ui/SearchInput.tsx";
import { Chip, CircleBtn } from "@/components/ui/Buttons.tsx";
import { Card, CardTitle, CardMeta } from "@/components/ui/Card.tsx";

export default function HomeMapPage() {
    const nav = useNavigate();
    const { filters, setFilter } = useAppStore(); // 필터 상태 및 수정 함수

    const { data = [], isLoading } = useQuery({
        queryKey: ["rooms"],
        queryFn: fetchRooms,
    });

    return (
        <>
            <HeaderRow>
                <Logo>Bilive</Logo>
                <Bell aria-label="notifications">🔔</Bell>
            </HeaderRow>

            <SearchBox>
                <span>🔎</span>
                <SearchField placeholder="어떤 합주실을 찾으시나요?" />
            </SearchBox>

            <ChipRow>
                {/* 현재 스토어의 필터 값 유무에 따라 텍스트 표시 */}
                <Chip onClick={() => setFilter("location", "마포구")}>
                    {filters.location || "위치"}
                </Chip>
                <Chip onClick={() => setFilter("datetime", "12/24 14:00")}>
                    {filters.datetime || "날짜 / 시간"}
                </Chip>
                <Chip onClick={() => setFilter("people", 4)}>
                    {filters.people ? `${filters.people}인` : "인원"}
                </Chip>
                <CircleBtn>≡</CircleBtn>
            </ChipRow>

            <MapArea>
                <MapPlaceholder>지도 영역</MapPlaceholder>
            </MapArea>

            <ListSection>
                <h2>근처 합주실</h2>
                {isLoading ? (
                    <p className="hint">불러오는 중…</p>
                ) : (
                    <CardGrid>
                        {data.map((r) => (
                            <Card key={r.id} onClick={() => nav(`/home/rooms/${r.id}`)}>
                                <CardTitle>{r.name}</CardTitle>
                                <CardMeta>{r.address}</CardMeta>
                                <CardMeta>
                                    {r.distanceKm}km · {r.pricePerHour.toLocaleString()}원/시간
                                </CardMeta>
                            </Card>
                        ))}
                    </CardGrid>
                )}
            </ListSection>
        </>
    );
}

/**
 * 고유 스타일 컴포넌트 (정돈된 형태)
 */

const HeaderRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const Logo = styled.div`
    font-weight: 800;
    font-size: 20px;
    color: ${({ theme }) => theme.colors.primary};
`;

const Bell = styled.button`
    border: 0;
    background: transparent;
    font-size: 18px;
    cursor: pointer;
`;

const ChipRow = styled.div`
    margin-top: 12px;
    display: flex;
    gap: 8px;
    align-items: center;
    overflow-x: auto;
    /* 스크롤바 숨기기 */
    -ms-overflow-style: none;
    scrollbar-width: none;
    &::-webkit-scrollbar { display: none; }
`;

const MapArea = styled.div`
    margin-top: 12px;
    height: 280px;
    border-radius: 16px;
    background: rgba(0, 0, 0, 0.05);
    border: 1px solid ${({ theme }) => theme.colors.border};
    overflow: hidden;
`;

const MapPlaceholder = styled.div`
    height: 100%;
    display: grid;
    place-items: center;
    color: #999;
    font-size: 13px;
`;

const ListSection = styled.div`
    margin-top: 14px;
`;

const CardGrid = styled.div`
    display: grid;
    gap: 10px;
`;