// HomeMapPage.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';

import { fetchRooms } from '@/api/rooms';
import { useAppStore } from '@/store/useAppStore';

import { SearchBox, SearchField } from '@/components/ui/SearchInput';
import { Chip } from '@/components/ui/Buttons';

import BellIconSrc from '@/assets/icons/Icon_bell.svg';
import SearchIconSrc from '@/assets/icons/Icon_search.svg';

import { useKakaoMap } from '@/hooks/useKakaoMap';

type Room = {
  id: string;
  name: string;
  address: string;

  latitude: number;
  longitude: number;

  pricePerHour: number;
  distanceKm: number;
  imageUrl: string;

  openStatus: string;
  rating: number;
  reviewCount: number;

  price?: string;

  // ✅ API 확장 필드
  people: number;
  discountRate: boolean;
};

type ActiveSheet = 'datetime' | 'people' | 'price' | null;

declare global {
  interface Window {
    kakao: any;
  }
}

export default function HomeMapPage() {
  const nav = useNavigate();
  const { filters, setFilter } = useAppStore();

  // ✅ fetchRooms에서 Room 타입을 내보내고 있다면, 여기 Room과 충돌할 수 있어서
  // queryFn 타입만 맞춰줌(런타임 영향 없음)
  const { data: roomsRaw = [], isLoading } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: fetchRooms as unknown as () => Promise<Room[]>,
  });

  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  useEffect(() => {
    console.log('data', roomsRaw);
  }, [roomsRaw]);
  // ✅ 검색어(name 필터)
  const [searchTerm, setSearchTerm] = useState('');

  // ===== Draft states =====
  const [draftDate, setDraftDate] = useState<Date>(() => new Date());
  const [draftStartHour, setDraftStartHour] = useState<number>(1);
  const [draftEndHour, setDraftEndHour] = useState<number>(1);
  console.log('filters', filters);
  const [draftPeople, setDraftPeople] = useState<number>(filters.people ? Number(filters.people) : 4);

  // ✅ 가격 range
  const [priceMin, setPriceMin] = useState<number>(0);
  const [priceMax, setPriceMax] = useState<number>(200000);

  const defaultCenter = useMemo(() => ({ lat: 37.5563, lng: 126.922 }), []);

  // overlay 관리
  const overlayMapRef = useRef<Map<string, any>>(new Map());
  const mapRef = useRef<any>(null);

  const normalizedRooms = useMemo(() => roomsRaw ?? [], [roomsRaw]);

  // ====== “리스트 표시 여부” : 처음엔 숨김 ======
  const hasAnyCondition =
    searchTerm.trim().length > 0 ||
    Boolean(filters.datetime) ||
    Boolean(filters.people) ||
    Boolean(filters.price) ||
    Boolean(filters.benefit);

  // ====== 선택된 필터 값 ======
  const selectedPeople = Number(filters.people || 0) || 0;
  const benefitOn = Boolean(filters.benefit);

  // ✅ 가격 계산 기준(요청대로): room.pricePerHour * room.people (API people)
  const getRoomTotalPrice = (r: Room) => r.pricePerHour * (r.people || 1);

  // =========================
  // ✅ 필터링 (정렬 포함)
  // =========================
  const filteredRooms = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    const list = normalizedRooms.filter((room) => {
      // 1) 검색: name 기준
      if (q && !room.name.toLowerCase().includes(q)) return false;

      // 2) 할인혜택 토글
      if (benefitOn && !room.discountRate) return false;

      // 3) 인원 필터: room.people로 필터링
      // - 5 이상이면 “5명 이상” 처리 -> room.people >= 5
      // - 그 외는 정확히 일치(room.people === selectedPeople)
      if (selectedPeople > 0) {
        if (selectedPeople >= 5) {
          if (room.people < 5) return false;
        } else {
          if (room.people !== selectedPeople) return false;
        }
      }

      // 4) 가격 필터: (pricePerHour * room.people) 기준으로 min/max
      // - "가격" 필터를 적용했을 때만 작동
      if (filters.price) {
        const total = getRoomTotalPrice(room);

        if (priceMin === 0 && priceMax === 0) {
          // “무료” 케이스를 진짜 0으로만 제한(데이터상 0이 없으면 결과 0개)
          if (total !== 0) return false;
        } else {
          if (total < priceMin) return false;
          if (total > priceMax) return false;
        }
      }

      // 5) datetime은 룸 데이터에 없으니 (표시만) 실제 필터링 X
      return true;
    });

    // ✅ 결과 고정 정렬(예: 12,13,14 순서 보장)
    return [...list].sort((a, b) => Number(a.id) - Number(b.id));
  }, [normalizedRooms, searchTerm, benefitOn, selectedPeople, filters.price, priceMin, priceMax]);

  const filteredRoomsRef = useRef<Room[]>([]);
  useEffect(() => {
    filteredRoomsRef.current = filteredRooms;
  }, [filteredRooms]);

  // =========================
  // Kakao Map
  // =========================
  const { mapElRef, ready, error, setCenter, panTo, getMap } = useKakaoMap({
    appKey: import.meta.env.VITE_KAKAO_MAP_KEY as string,
    center: defaultCenter,
    level: 5,
    onIdle: (map) => {
      mapRef.current = map;
      // ✅ bounds 기반 제거: 필터된 전체를 지도에 표시
      renderOverlaysAll(map, filteredRoomsRef.current, overlayMapRef.current);
    },
  });

  // 최초 중심
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current ?? getMap();
    if (!map) return;
    mapRef.current = map;

    const first = normalizedRooms[0];
    if (first) setCenter({ lat: first.latitude, lng: first.longitude });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, normalizedRooms]);

  // ✅ 필터 변경 → 마커 즉시 갱신 + 결과가 보이게 fitBounds(조건 적용 시)
  useEffect(() => {
    if (!ready) return;
    const map = mapRef.current ?? getMap();
    if (!map) return;
    mapRef.current = map;

    // 항상 filteredRooms 기준으로 마커 갱신
    renderOverlaysAll(map, filteredRooms, overlayMapRef.current);

    // ✅ “조건이 적용된 상태”에서만 fitBounds (처음엔 리스트도 숨기니 카메라 이동도 최소화)
    if (hasAnyCondition && filteredRooms.length > 0 && window.kakao?.maps) {
      const bounds = new window.kakao.maps.LatLngBounds();
      filteredRooms.forEach((r) => bounds.extend(new window.kakao.maps.LatLng(r.latitude, r.longitude)));
      map.setBounds(bounds);
    }
  }, [ready, filteredRooms, getMap, hasAnyCondition]);

  const handleRecenter = () => {
    if (hasAnyCondition && filteredRooms.length > 0 && window.kakao?.maps && mapRef.current) {
      const bounds = new window.kakao.maps.LatLngBounds();
      filteredRooms.forEach((r) => bounds.extend(new window.kakao.maps.LatLng(r.latitude, r.longitude)));
      mapRef.current.setBounds(bounds);
      return;
    }
    panTo(defaultCenter);
  };

  // Chip active
  const isDatetimeActive = activeSheet === 'datetime' || Boolean(filters.datetime);
  const isPeopleActive = activeSheet === 'people' || Boolean(filters.people);
  const isPriceActive = activeSheet === 'price' || Boolean(filters.price);
  const isBenefitActive = Boolean(filters.benefit);

  const datetimeChipLabel = filters.datetime ? String(filters.datetime) : '날짜 / 시간';
  const peopleChipLabel = filters.people ? `${filters.people}인` : '인원';
  const priceChipLabel = filters.price ? String(filters.price) : '가격';

  const toggleBenefit = () => {
    setActiveSheet(null);
    const isOn = Boolean(filters.benefit);
    setFilter('benefit', isOn ? '' : '할인혜택');
  };

  const applyDatetime = () => {
    const y = draftDate.getFullYear();
    const m = String(draftDate.getMonth() + 1).padStart(2, '0');
    const d = String(draftDate.getDate()).padStart(2, '0');

    const start = `${String(draftStartHour).padStart(2, '0')}:00`;
    const end = `${String(draftEndHour).padStart(2, '0')}:00`;

    setFilter('datetime', `${y}-${m}-${d} ${start}~${end}`);
    setActiveSheet(null);
  };

  const applyPeople = () => {
    setFilter('people', draftPeople);
    setActiveSheet(null);
  };

  const applyPrice = () => {
    const min = priceMin;
    const max = priceMax;

    if (min === 0 && max === 0) {
      setFilter('price', '무료');
      setActiveSheet(null);
      return;
    }
    if (min === 0) {
      setFilter('price', `${formatWon(max)}원 이하`);
      setActiveSheet(null);
      return;
    }
    setFilter('price', `${formatWon(min)}~${formatWon(max)}원`);
    setActiveSheet(null);
  };

  const openSheet = (s: Exclude<ActiveSheet, null>) => {
    if (s === 'people') setDraftPeople(filters.people ? Number(filters.people) : 4);

    if (s === 'datetime') {
      const v = String(filters.datetime || '');
      const match = v.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):00~(\d{2}):00$/);
      if (match) {
        const yyyy = Number(match[1]);
        const mm = Number(match[2]) - 1;
        const dd = Number(match[3]);
        const sh = Number(match[4]);
        const eh = Number(match[5]);
        setDraftDate(new Date(yyyy, mm, dd));
        setDraftStartHour(sh);
        setDraftEndHour(eh);
      } else {
        setDraftDate(new Date());
        setDraftStartHour(1);
        setDraftEndHour(1);
      }
    }
    setActiveSheet(s);
  };

  const closeSheet = () => setActiveSheet(null);

  return (
    <Screen>
      <MapDiv ref={mapElRef} />

      <TopOverlay>
        <HeaderRow>
          <Logo>Bilive</Logo>
          <Bell aria-label='notifications'>
            <img src={BellIconSrc} alt='알림' width={24} height={24} />
          </Bell>
        </HeaderRow>

        <SearchBox>
          <img src={SearchIconSrc} alt='검색' width={18} height={18} />
          <SearchField
            placeholder='어떤 합주실을 찾으시나요?'
            value={searchTerm}
            onChange={(e: any) => setSearchTerm(e.target.value)}
          />
        </SearchBox>

        <ChipRow>
          <ChipButton aria-pressed={isDatetimeActive} onClick={() => openSheet('datetime')}>
            {datetimeChipLabel}
          </ChipButton>

          <ChipButton aria-pressed={isPeopleActive} onClick={() => openSheet('people')}>
            {peopleChipLabel}
          </ChipButton>

          <ChipButton aria-pressed={isPriceActive} onClick={() => openSheet('price')}>
            {priceChipLabel}
          </ChipButton>

          <ChipButton aria-pressed={isBenefitActive} onClick={toggleBenefit}>
            할인혜택
          </ChipButton>
        </ChipRow>
      </TopOverlay>

      <RecenterBtn type='button' aria-label='recenter' onClick={handleRecenter}>
        ⌁
      </RecenterBtn>

      {isLoading && <MapLoading>불러오는 중…</MapLoading>}
      {error && <MapError>지도 로드 실패: {error.message}</MapError>}

      {/* ✅ 검색/필터 적용 전엔 결과 리스트 숨김 */}
      {hasAnyCondition && (
        <ResultListWrap>
          <ResultHeader>
            <ResultCount>검색 결과 {filteredRooms.length}개</ResultCount>
          </ResultHeader>

          <ResultList>
            {filteredRooms.map((room) => {
              const total = getRoomTotalPrice(room); // ✅ pricePerHour * room.people
              return (
                <ResultItem
                  key={room.id}
                  type='button'
                  onClick={() => {
                    panTo({ lat: room.latitude, lng: room.longitude });
                  }}
                >
                  <ResultThumb>
                    <img src={room.imageUrl} alt={room.name} />
                  </ResultThumb>

                  <ResultInfo>
                    <ResultTitle>
                      {room.name} <ResultIdTag>#{room.id}</ResultIdTag>
                    </ResultTitle>
                    <ResultSub>{room.openStatus}</ResultSub>
                    <ResultAddr>{room.address}</ResultAddr>

                    <ResultMeta>
                      <span>★ {room.rating}</span>
                      <span>리뷰 {room.reviewCount}</span>
                      <span>{room.people}인</span>
                      {room.discountRate && <DiscountBadge>할인</DiscountBadge>}
                    </ResultMeta>

                    {/* ✅ 가격 필터를 적용했을 때 “곱한 값”이 의미 있으니 강조 표시 */}
                    {Boolean(filters.price) ? (
                      <ResultPrice>
                        <strong>총 {formatWon(total)}원</strong>
                        <span>
                          ({room.people}인 × {formatWon(room.pricePerHour)}원/시간)
                        </span>
                      </ResultPrice>
                    ) : (
                      <ResultPrice>
                        <strong>1시간 {formatWon(room.pricePerHour)}원</strong>
                        <span>최대 {room.people}인</span>
                      </ResultPrice>
                    )}
                  </ResultInfo>

                  <ResultGo
                    type='button'
                    onClick={(e) => {
                      e.stopPropagation();
                      nav(`/home/rooms/${room.id}`);
                    }}
                  >
                    상세
                  </ResultGo>
                </ResultItem>
              );
            })}
          </ResultList>
        </ResultListWrap>
      )}

      <BottomSheet open={activeSheet !== null} onClose={closeSheet}>
        {activeSheet === 'datetime' && (
          <DateTimeSheet
            draftDate={draftDate}
            setDraftDate={setDraftDate}
            startHour={draftStartHour}
            endHour={draftEndHour}
            setStartHour={setDraftStartHour}
            setEndHour={setDraftEndHour}
            onApply={applyDatetime}
          />
        )}

        {activeSheet === 'people' && (
          <PeopleSheet people={draftPeople} setPeople={setDraftPeople} onApply={applyPeople} />
        )}

        {activeSheet === 'price' && (
          <PriceSheet min={priceMin} max={priceMax} setMin={setPriceMin} setMax={setPriceMax} onApply={applyPrice} />
        )}
      </BottomSheet>
    </Screen>
  );
}

/** ✅ bounds 없이 “필터된 전체”를 지도에 표시 */
function renderOverlaysAll(map: any, rooms: Room[], overlayMap: Map<string, any>) {
  if (!window.kakao?.maps) return;
  if (!map) return;

  const ids = new Set(rooms.map((r) => String(r.id)));

  // 제거
  overlayMap.forEach((overlay, id) => {
    if (!ids.has(id)) {
      overlay.setMap(null);
      overlayMap.delete(id);
    }
  });

  // 추가
  rooms.forEach((room) => {
    const id = String(room.id);
    if (overlayMap.has(id)) return;

    const position = new window.kakao.maps.LatLng(room.latitude, room.longitude);

    const content = document.createElement('div');
    content.className = 'bilive-marker';
    content.innerHTML = `<div class="pin"></div>`;

    const overlay = new window.kakao.maps.CustomOverlay({
      position,
      content,
      yAnchor: 1,
    });

    overlay.setMap(map);
    overlayMap.set(id, overlay);
  });
}

/** BottomSheet */
function BottomSheet({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <>
      <Dim open={open} onClick={onClose} />
      <SheetWrap open={open} role='dialog' aria-modal='true'>
        <SheetHandle />
        <SheetBody>{children}</SheetBody>
      </SheetWrap>
    </>
  );
}

/** DateTime Sheet */
function DateTimeSheet({
  draftDate,
  setDraftDate,
  startHour,
  endHour,
  setStartHour,
  setEndHour,
  onApply,
}: {
  draftDate: Date;
  setDraftDate: (d: Date) => void;
  startHour: number;
  endHour: number;
  setStartHour: (n: number) => void;
  setEndHour: (n: number) => void;
  onApply: () => void;
}) {
  const [monthCursor, setMonthCursor] = useState<Date>(() => startOfMonth(draftDate));

  useEffect(() => setMonthCursor(startOfMonth(draftDate)), [draftDate]);

  const monthLabel = `${monthCursor.getFullYear()}년 ${monthCursor.getMonth() + 1}월`;
  const weeks = useMemo(() => buildMonthMatrix(monthCursor), [monthCursor]);

  const clampStart = (v: number) => Math.min(v, endHour);
  const clampEnd = (v: number) => Math.max(v, startHour);

  return (
    <SheetContent>
      <SheetHeaderRow>
        <HeaderArrow type='button' onClick={() => setMonthCursor(addMonths(monthCursor, -1))}>
          ‹
        </HeaderArrow>
        <SheetHeaderTitle>{monthLabel}</SheetHeaderTitle>
        <HeaderArrow type='button' onClick={() => setMonthCursor(addMonths(monthCursor, 1))}>
          ›
        </HeaderArrow>
      </SheetHeaderRow>

      <CalendarGrid>
        <WeekHeader>
          {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
            <WeekDay key={d}>{d}</WeekDay>
          ))}
        </WeekHeader>

        <DaysGrid>
          {weeks.flat().map((cell, idx) => {
            const isCurrentMonth = cell.getMonth() === monthCursor.getMonth();
            const isSelected = isSameDay(cell, draftDate);
            return (
              <DayBtn
                key={`${cell.toISOString()}-${idx}`}
                type='button'
                data-dim={!isCurrentMonth}
                data-selected={isSelected}
                onClick={() => setDraftDate(cell)}
              >
                {cell.getDate()}
              </DayBtn>
            );
          })}
        </DaysGrid>
      </CalendarGrid>

      <SectionLabel>시간 범위</SectionLabel>

      <TimeRangeWrap>
        <TimeRangeTop>
          <TimeBadge>시작 {String(startHour).padStart(2, '0')}:00</TimeBadge>
          <TimeBadge>종료 {String(endHour).padStart(2, '0')}:00</TimeBadge>
        </TimeRangeTop>

        <TimeTrackArea>
          <TimeTrackBase />
          <TimeTrackFill
            style={{
              left: `${(startHour / 23) * 100}%`,
              width: `${((endHour - startHour) / 23) * 100}%`,
            }}
          />
        </TimeTrackArea>

        <TimeDualRange>
          <input
            type='range'
            min={0}
            max={23}
            step={1}
            value={startHour}
            onChange={(e) => setStartHour(clampStart(Number(e.target.value)))}
          />
          <input
            type='range'
            min={0}
            max={23}
            step={1}
            value={endHour}
            onChange={(e) => setEndHour(clampEnd(Number(e.target.value)))}
          />
        </TimeDualRange>
      </TimeRangeWrap>

      <ApplyBtn type='button' onClick={onApply}>
        적용하기
      </ApplyBtn>
    </SheetContent>
  );
}

/** People Sheet */
function PeopleSheet({
  people,
  setPeople,
  onApply,
}: {
  people: number;
  setPeople: (n: number) => void;
  onApply: () => void;
}) {
  const dec = () => setPeople(Math.max(1, people - 1));
  const inc = () => setPeople(Math.min(20, people + 1));

  const quick = ['2명', '3명', '4명', '5명', '5명 이상'];

  return (
    <SheetContent>
      <SheetTitle>기준인원</SheetTitle>

      <PeopleRow>
        <PeopleLabel>
          <PeopleIcon>👤</PeopleIcon>
          인원 선택
        </PeopleLabel>

        <Stepper>
          <StepBtn type='button' onClick={dec}>
            −
          </StepBtn>
          <StepValue>{people}</StepValue>
          <StepBtn type='button' onClick={inc}>
            +
          </StepBtn>
        </Stepper>
      </PeopleRow>

      <QuickPills>
        {quick.map((label) => {
          const n = label === '5명 이상' ? 5 : Number(label.replace('명', ''));
          const pressed = label === '5명 이상' ? people >= 5 : people === n;
          return (
            <Pill key={label} type='button' aria-pressed={pressed} onClick={() => setPeople(n)}>
              {label}
            </Pill>
          );
        })}
      </QuickPills>

      <ApplyBtn type='button' onClick={onApply}>
        적용하기
      </ApplyBtn>
    </SheetContent>
  );
}

/** Price Sheet */
function PriceSheet({
  min,
  max,
  setMin,
  setMax,
  onApply,
}: {
  min: number;
  max: number;
  setMin: (n: number) => void;
  setMax: (n: number) => void;
  onApply: () => void;
}) {
  const clampMin = (v: number) => Math.min(v, max - 1000);
  const clampMax = (v: number) => Math.max(v, min + 1000);

  return (
    <SheetContent>
      <SheetTitle>가격</SheetTitle>

      <RangeWrap>
        <RangeTop>
          <RangeText>{formatWon(min)}원</RangeText>
          <RangeText>{formatWon(max)}원+</RangeText>
        </RangeTop>

        <TrackArea>
          <TrackBase />
          <TrackFill
            style={{
              left: `${(min / 200000) * 100}%`,
              width: `${((max - min) / 200000) * 100}%`,
            }}
          />
        </TrackArea>

        <DualRange>
          <input
            type='range'
            min={0}
            max={200000}
            step={1000}
            value={min}
            onChange={(e) => setMin(clampMin(Number(e.target.value)))}
          />
          <input
            type='range'
            min={0}
            max={200000}
            step={1000}
            value={max}
            onChange={(e) => setMax(clampMax(Number(e.target.value)))}
          />
        </DualRange>
      </RangeWrap>

      <QuickPills>
        <Pill type='button' aria-pressed={min === 0 && max === 0} onClick={() => (setMin(0), setMax(0))}>
          무료
        </Pill>
        <Pill type='button' aria-pressed={min === 0 && max === 50000} onClick={() => (setMin(0), setMax(50000))}>
          5만원 이하
        </Pill>
        <Pill
          type='button'
          aria-pressed={min === 50000 && max === 100000}
          onClick={() => (setMin(50000), setMax(100000))}
        >
          5~10만원
        </Pill>
        <Pill
          type='button'
          aria-pressed={min === 100000 && max === 200000}
          onClick={() => (setMin(100000), setMax(200000))}
        >
          10~20만원
        </Pill>
      </QuickPills>

      <ApplyBtn type='button' onClick={onApply}>
        적용하기
      </ApplyBtn>
    </SheetContent>
  );
}

/** Utils */
function formatWon(v: number) {
  return v.toLocaleString('ko-KR');
}
function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}
function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
function buildMonthMatrix(monthCursor: Date) {
  const first = new Date(monthCursor.getFullYear(), monthCursor.getMonth(), 1);
  const startDay = first.getDay();
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - startDay);

  const weeks: Date[][] = [];
  let curr = new Date(gridStart);

  for (let w = 0; w < 6; w += 1) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d += 1) {
      week.push(new Date(curr));
      curr.setDate(curr.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

/** =========================
 * Styled
 * ========================= */
const Screen = styled.div`
  position: relative;
  width: 100%;
  height: 100dvh;
  overflow: hidden;

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

const ChipButton = styled(Chip)`
  &[aria-pressed='true'] {
    background: rgba(124, 58, 237, 0.95);
    color: #fff;
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
  bottom: 140px;
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

/* ✅ 결과 리스트 */
const ResultListWrap = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 50px;
  z-index: 12;
  background: rgba(255, 255, 255, 0.98);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  box-shadow: 0 -12px 30px rgba(0, 0, 0, 0.08);
  overflow: hidden;
`;

const ResultHeader = styled.div`
  padding: 12px 14px 8px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
`;

const ResultCount = styled.div`
  font-size: 13px;
  font-weight: 900;
  color: #111;
`;

const ResultList = styled.div`
  max-height: 240px;
  overflow: auto;
  padding: 10px 12px 14px;
`;

const ResultItem = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  display: grid;
  grid-template-columns: 64px 1fr auto;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(0, 0, 0, 0.03);
  }

  & + & {
    margin-top: 8px;
  }
`;

const ResultThumb = styled.div`
  width: 64px;
  height: 64px;
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

const ResultInfo = styled.div`
  display: grid;
  gap: 4px;
`;

const ResultTitle = styled.div`
  font-size: 14px;
  font-weight: 900;
  color: #111;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ResultIdTag = styled.span`
  font-size: 11px;
  font-weight: 900;
  color: rgba(124, 58, 237, 1);
  background: rgba(124, 58, 237, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
`;

const ResultSub = styled.div`
  font-size: 12px;
  color: #777;
`;

const ResultAddr = styled.div`
  font-size: 12px;
  color: #888;
`;

const ResultMeta = styled.div`
  margin-top: 2px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11px;
  color: #555;
  font-weight: 800;
`;

const DiscountBadge = styled.span`
  font-size: 11px;
  font-weight: 900;
  color: rgba(124, 58, 237, 1);
  background: rgba(124, 58, 237, 0.12);
  padding: 2px 8px;
  border-radius: 999px;
`;

const ResultPrice = styled.div`
  margin-top: 2px;
  display: grid;
  gap: 2px;

  strong {
    font-size: 13px;
    font-weight: 900;
    color: rgba(124, 58, 237, 1);
  }

  span {
    font-size: 11px;
    color: #777;
    font-weight: 800;
  }
`;

const ResultGo = styled.button`
  align-self: center;
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(124, 58, 237, 0.2);
  background: rgba(124, 58, 237, 0.08);
  color: rgba(124, 58, 237, 1);
  font-weight: 900;
  cursor: pointer;
`;

/* ===== BottomSheet ===== */
const Dim = styled.div<{ open: boolean }>`
  position: absolute;
  inset: 0;
  z-index: 90;
  background: rgba(0, 0, 0, 0.35);
  opacity: ${({ open }) => (open ? 1 : 0)};
  pointer-events: ${({ open }) => (open ? 'auto' : 'none')};
  transition: opacity 160ms ease;
`;

const SheetWrap = styled.div<{ open: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 50px;
  z-index: 100;
  background: #fff;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  box-shadow: 0 -14px 30px rgba(0, 0, 0, 0.12);

  transform: translateY(${({ open }) => (open ? '0%' : '110%')});
  transition: transform 200ms ease;
`;

const SheetHandle = styled.div`
  width: 44px;
  height: 4px;
  border-radius: 999px;
  margin: 10px auto 6px;
  background: rgba(0, 0, 0, 0.14);
`;

const SheetBody = styled.div`
  padding: 10px 16px 18px;
`;

const SheetContent = styled.div`
  display: grid;
  gap: 12px;
`;

const SheetHeaderRow = styled.div`
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  align-items: center;
`;

const HeaderArrow = styled.button`
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 26px;
  line-height: 1;
  color: #444;
`;

const SheetHeaderTitle = styled.div`
  text-align: center;
  font-weight: 900;
  color: #111;
`;

const SheetTitle = styled.div`
  font-weight: 900;
  font-size: 14px;
  color: #111;
`;

const CalendarGrid = styled.div`
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 10px;
`;

const WeekHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  margin-bottom: 6px;
`;

const WeekDay = styled.div`
  font-size: 11px;
  color: #888;
  text-align: center;
  font-weight: 800;
`;

const DaysGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
`;

const DayBtn = styled.button`
  height: 34px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  cursor: pointer;
  font-weight: 900;
  color: #111;

  &[data-dim='true'] {
    color: #c8c8c8;
  }

  &[data-selected='true'] {
    background: rgba(124, 58, 237, 0.95);
    color: #fff;
  }
`;

const SectionLabel = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: #111;
`;

const TimeRangeWrap = styled.div`
  padding: 10px 10px 6px;
  border-radius: 14px;
  border: 1px solid rgba(124, 58, 237, 0.2);
  background: rgba(124, 58, 237, 0.06);
`;

const TimeRangeTop = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const TimeBadge = styled.div`
  font-size: 12px;
  font-weight: 900;
  color: #111;
`;

const TimeTrackArea = styled.div`
  position: relative;
  height: 6px;
  border-radius: 999px;
  margin-top: 6px;
  margin-bottom: 12px;
`;

const TimeTrackBase = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.22);
`;

const TimeTrackFill = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.95);
`;

const TimeDualRange = styled.div`
  position: relative;
  height: 28px;
  margin-top: -22px;

  input[type='range'] {
    position: absolute;
    left: -2px;
    right: 0;
    top: -13px;
    width: 100%;
    -webkit-appearance: none;
    background: transparent;
    height: 28px;
    pointer-events: none;
  }

  input[type='range']::-webkit-slider-thumb {
    pointer-events: auto;
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 999px;
    background: rgba(124, 58, 237, 1);
    border: 1px solid #fff;
    box-shadow: 0 8px 18px rgba(124, 58, 237, 0.25);
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: transparent;
  }
`;

const PeopleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PeopleLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 900;
  color: #111;
`;

const PeopleIcon = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.12);
  display: grid;
  place-items: center;
  font-size: 14px;
`;

const Stepper = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const StepBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  cursor: pointer;
  font-size: 18px;
  font-weight: 900;
  color: #111;
`;

const StepValue = styled.div`
  width: 34px;
  text-align: center;
  font-weight: 900;
  color: #111;
`;

const RangeWrap = styled.div`
  padding: 10px 10px 6px;
  border-radius: 14px;
  border: 1px solid rgba(124, 58, 237, 0.2);
  background: rgba(124, 58, 237, 0.06);
`;

const RangeTop = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  font-weight: 900;
  color: #111;
  margin-bottom: 10px;
`;

const RangeText = styled.div`
  color: #111;
`;

const TrackArea = styled.div`
  position: relative;
  height: 6px;
  border-radius: 999px;
  margin-top: 6px;
  margin-bottom: 12px;
`;

const TrackBase = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.22);
`;

const TrackFill = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  border-radius: 999px;
  background: rgba(124, 58, 237, 0.95);
`;

const DualRange = styled.div`
  position: relative;
  height: 28px;
  margin-top: -22px;

  input[type='range'] {
    position: absolute;
    left: -2px;
    right: 0;
    top: -13px;
    width: 100%;
    -webkit-appearance: none;
    background: transparent;
    height: 28px;
    pointer-events: none;
  }

  input[type='range']::-webkit-slider-thumb {
    pointer-events: auto;
    -webkit-appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 999px;
    background: rgba(124, 58, 237, 1);
    border: 1px solid #fff;
    box-shadow: 0 8px 18px rgba(124, 58, 237, 0.25);
  }

  input[type='range']::-webkit-slider-runnable-track {
    height: 6px;
    border-radius: 999px;
    background: transparent;
  }
`;

const QuickPills = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Pill = styled.button`
  height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  background: #fff;
  cursor: pointer;
  font-weight: 900;
  font-size: 12px;
  color: #111;

  &[aria-pressed='true'] {
    border-color: rgba(124, 58, 237, 0.9);
    background: rgba(124, 58, 237, 0.14);
    color: rgba(124, 58, 237, 1);
  }
`;

const ApplyBtn = styled.button`
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 14px;
  background: rgba(124, 58, 237, 0.95);
  color: #fff;
  font-weight: 900;
  cursor: pointer;
`;
