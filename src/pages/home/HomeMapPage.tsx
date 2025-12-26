import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';

import { fetchRooms } from '@/api/rooms';
import { useAppStore } from '@/store/useAppStore';

import { SearchBox, SearchField } from '@/components/ui/SearchInput';
import { Chip, CircleBtn } from '@/components/ui/Buttons';

import BellIconSrc from '@/assets/icons/Icon_bell.svg';
import SearchIconSrc from '@/assets/icons/Icon_search.svg';
import FilterIconSrc from '@/assets/icons/Icon_filter.svg';

import { useKakaoMap } from '@/hooks/useKakaoMap';

type Room = {
  id: string; // ✅ API가 string
  name: string;
  address: string;

  // ✅ API 기준
  latitude: number;
  longitude: number;

  pricePerHour: number;
  distanceKm: number;
  imageUrl: string;

  openStatus: string; // "영업 중 ･ 23:00에 영업 종료"
  rating: number;
  reviewCount: number;

  price?: string; // "14,000" (표시용 문자열) - 응답에 있음
};

declare global {
  interface Window {
    kakao: any;
  }
}

export default function HomeMapPage() {
  const nav = useNavigate();
  const { filters, setFilter } = useAppStore();

  const { data: rooms = [], isLoading } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: fetchRooms,
  });

  // ✅ idle 리스너에서 최신 rooms 참조 (stale 방지)
  const roomsRef = useRef<Room[]>([]);
  useEffect(() => {
    roomsRef.current = rooms;
  }, [rooms]);

  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  // 초기 중심(홍대)
  const defaultCenter = useMemo(() => ({ lat: 37.5563, lng: 126.922 }), []);

  // overlay map 관리
  const overlayMapRef = useRef<Map<string, any>>(new Map());

  const { mapElRef, ready, error, setCenter, panTo, getMap } = useKakaoMap({
    appKey: import.meta.env.VITE_KAKAO_MAP_KEY as string,
    center: defaultCenter,
    level: 5,
    onIdle: (map) => {
      renderVisibleOverlays(map, roomsRef.current, overlayMapRef.current, setSelectedRoom);
    },
  });

  /** 데이터 로딩 후: 첫 데이터 중심으로 이동 + 마커 렌더 */
  useEffect(() => {
    if (!ready) return;
    const map = getMap();
    if (!map) return;

    if (rooms.length > 0) {
      const first = rooms[0];
      setCenter({ lat: first.latitude, lng: first.longitude });
    }

    renderVisibleOverlays(map, rooms, overlayMapRef.current, setSelectedRoom);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, rooms]);

  const handleRecenter = () => {
    if (selectedRoom) {
      panTo({ lat: selectedRoom.latitude, lng: selectedRoom.longitude });
      return;
    }
    panTo(defaultCenter);
  };

  const priceLabel = selectedRoom?.price?.trim()
    ? selectedRoom.price
    : selectedRoom
    ? selectedRoom.pricePerHour.toLocaleString()
    : '';

  return (
    <Screen>
      {/* ✅ 지도 풀스크린 */}
      <MapDiv ref={mapElRef} />

      {/* ✅ 상단 오버레이 UI */}
      <TopOverlay>
        <HeaderRow>
          <Logo>Bilive</Logo>
          <Bell aria-label='notifications'>
            <img src={BellIconSrc} alt='알림' width={24} height={24} />
          </Bell>
        </HeaderRow>

        <SearchBox>
          <img src={SearchIconSrc} alt='검색' width={18} height={18} />
          <SearchField placeholder='어떤 합주실을 찾으시나요?' />
        </SearchBox>

        <ChipRow>
          <Chip onClick={() => setFilter('datetime', '12/24 14:00')}>{filters.datetime || '날짜 / 시간'}</Chip>
          <Chip onClick={() => setFilter('people', 4)}>{filters.people ? `${filters.people}인` : '인원'}</Chip>
          <Chip onClick={() => setFilter('price', '5만원 이하')}>{filters.price || '가격'}</Chip>
          <Chip onClick={() => setFilter('benefit', '할인')}>{filters.benefit || '할인혜택'}</Chip>
          <CircleBtn>
            <img src={FilterIconSrc} alt='필터' width={18} height={18} />
          </CircleBtn>
        </ChipRow>
      </TopOverlay>

      {/* 오른쪽 버튼들 */}
      <RecenterBtn type='button' aria-label='recenter' onClick={handleRecenter}>
        ⌁
      </RecenterBtn>

      {isLoading && <MapLoading>불러오는 중…</MapLoading>}

      {/* ✅ 에러 표시(개발 중) */}
      {error && <MapError>지도 로드 실패: {error.message}</MapError>}

      {/* 하단 미리보기 */}
      {selectedRoom && (
        <PreviewSheet>
          <PreviewInner>
            <PreviewClose onClick={() => setSelectedRoom(null)} aria-label='close'>
              ×
            </PreviewClose>

            <PreviewRow>
              <Thumb>
                <img src={selectedRoom.imageUrl} alt={selectedRoom.name} />
              </Thumb>

              <Info>
                <Title>{selectedRoom.name}</Title>

                {/* ✅ openStatus 사용 + 주소는 아래로 */}
                <SubLine>{selectedRoom.openStatus}</SubLine>
                <AddressLine>{selectedRoom.address}</AddressLine>

                <MetaLine>
                  <Dot>★</Dot>
                  <span>
                    {selectedRoom.rating} · 리뷰 {selectedRoom.reviewCount}
                  </span>
                </MetaLine>

                <PriceLine>
                  <strong>1시간 {priceLabel}원</strong>
                </PriceLine>
              </Info>
            </PreviewRow>

            <PrimaryBtn onClick={() => nav(`/home/rooms/${selectedRoom.id}`)}>예약하기</PrimaryBtn>
          </PreviewInner>
        </PreviewSheet>
      )}
    </Screen>
  );
}

/** ====== overlay renderer ====== */
function renderVisibleOverlays(
  map: any,
  allRooms: Room[],
  overlayMap: Map<string, any>,
  setSelectedRoom: (r: Room) => void
) {
  if (!window.kakao?.maps) return;

  const bounds = map.getBounds();
  if (!bounds) return;

  const visible = allRooms.filter((r) => {
    const latlng = new window.kakao.maps.LatLng(r.latitude, r.longitude);
    return bounds.contain(latlng);
  });

  const visibleIds = new Set(visible.map((v) => String(v.id)));

  // 제거
  overlayMap.forEach((overlay, id) => {
    if (!visibleIds.has(id)) {
      overlay.setMap(null);
      overlayMap.delete(id);
    }
  });

  // 추가
  visible.forEach((room) => {
    const id = String(room.id);
    if (overlayMap.has(id)) return;

    const position = new window.kakao.maps.LatLng(room.latitude, room.longitude);

    const content = document.createElement('div');
    content.className = 'bilive-marker';
    content.innerHTML = `<div class="pin"></div>`;
    content.onclick = () => setSelectedRoom(room);

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content,
      yAnchor: 1,
    });

    overlay.setMap(map);
    overlayMap.set(id, overlay);
  });
}

/** ===== Styled ===== */

const Screen = styled.div`
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;

  /* CustomOverlay 마커 스타일 */
  .bilive-marker {
    width: 28px;
    height: 28px;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }
  .bilive-marker .pin {
    width: 18px;
    height: 18px;
    margin: 0 auto;
    border-radius: 999px;
    background: rgba(124, 58, 237, 0.92);
    box-shadow: 0 8px 18px rgba(124, 58, 237, 0.28);
    border: 3px solid rgba(255, 255, 255, 0.9);
  }
`;

const MapDiv = styled.div`
  position: absolute;
  inset: 0;
`;

const TopOverlay = styled.div`
  position: absolute;
  left: 16px;
  right: 16px;
  top: 14px;
  display: grid;
  gap: 10px;
  z-index: 10;
  pointer-events: none;

  & > * {
    pointer-events: auto;
  }
`;

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
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
  border-radius: 999px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  display: grid;
  place-items: center;
`;

const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  overflow-x: auto;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const MapLoading = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  z-index: 11;
  padding: 8px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  font-size: 12px;
  color: #666;
`;

const MapError = styled.div`
  position: absolute;
  top: 58px;
  left: 16px;
  right: 16px;
  z-index: 11;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 235, 235, 0.95);
  color: #c0392b;
  font-size: 12px;
`;

const RecenterBtn = styled.button`
  position: absolute;
  right: 14px;
  bottom: 168px;
  z-index: 12;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: rgba(255, 255, 255, 0.94);
  display: grid;
  place-items: center;
  cursor: pointer;
  font-size: 18px;
`;

const PreviewSheet = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 60px;
  z-index: 12;
  padding: 12px 12px 14px;
  background: rgba(255, 255, 255, 0.98);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  box-shadow: 0 -12px 30px rgba(0, 0, 0, 0.08);
`;

const PreviewInner = styled.div`
  position: relative;
`;

const PreviewClose = styled.button`
  position: absolute;
  right: 2px;
  top: 2px;
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  color: #777;
`;

const PreviewRow = styled.div`
  display: grid;
  grid-template-columns: 74px 1fr;
  gap: 12px;
  padding-right: 26px;
`;

const Thumb = styled.div`
  width: 74px;
  height: 74px;
  border-radius: 14px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.04);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const Info = styled.div`
  display: grid;
  gap: 4px;
`;

const Title = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #111;
`;

const SubLine = styled.div`
  font-size: 12px;
  color: #777;
`;

const AddressLine = styled.div`
  font-size: 12px;
  color: #888;
`;

const MetaLine = styled.div`
  font-size: 12px;
  color: #444;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.span`
  font-size: 12px;
`;

const PriceLine = styled.div`
  margin-top: 2px;
  font-size: 13px;
  display: flex;
  align-items: baseline;
  gap: 6px;

  strong {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 900;
  }
`;

const PrimaryBtn = styled.button`
  margin-top: 12px;
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.primary};
  color: #fff;
  font-weight: 800;
  cursor: pointer;
`;
