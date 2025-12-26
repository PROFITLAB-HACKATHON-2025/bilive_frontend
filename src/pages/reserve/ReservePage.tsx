import { useState, useMemo, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '@/styles/theme';
import IconPerson from '@/assets/icons/Icon_person.svg';

// --- 타입 및 상수 ---
type OptionItem = {
  name: string;
  count: number;
};
const OPTION_PRICE_PER_HOUR = 1000;

export default function ReservePage() {
  const contentRef = useRef<HTMLDivElement>(null);

  // ✅ 페이지 진입 시 강제로 스크롤을 최상단으로 이동
  useEffect(() => {
    // 1. 브라우저 복원 기능 무시하고 즉시 이동
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    // 2. 렌더링 직후 확실하게 다시 이동 (타이밍 이슈 방지)
    const timer = setTimeout(() => {
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const navigate = useNavigate();
  const location = useLocation();
  const { roomName, hourlyPrice } = location.state || {
    roomName: '합주실',
    hourlyPrice: 15000,
  };

  // --- 상태 관리 ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [selectedTimes, setSelectedTimes] = useState<number[]>([]);
  const [personCount, setPersonCount] = useState<number>(1);
  const [options, setOptions] = useState<OptionItem[]>([
    { name: '베이스', count: 0 },
    { name: '기타앰프', count: 0 },
    { name: '통기타', count: 0 },
    { name: '키보드', count: 0 },
    { name: '일렉기타', count: 0 },
    { name: '스틱', count: 0 },
  ]);

  // --- 캘린더 로직 ---
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const { firstDayOfWeek, daysInMonth } = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    return { firstDayOfWeek: firstDay, daysInMonth: lastDate };
  }, [year, month]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  }, [firstDayOfWeek, daysInMonth]);

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleDateClick = (day: number) => {
    const newDate = new Date(year, month, day);
    if (newDate < today) return;

    setSelectedDate(newDate);
    setSelectedTimes([]);
  };

  // --- 시간 로직 ---
  const timesAM = Array.from({ length: 12 }, (_, i) => i);
  const timesPM = Array.from({ length: 12 }, (_, i) => i + 12);

  const fixedDisabledTimes = [3, 4, 5];

  const isTimeDisabled = (time: number) => {
    if (fixedDisabledTimes.includes(time)) return true;
    if (selectedDate.getTime() === today.getTime()) {
      const currentHour = new Date().getHours();
      if (time <= currentHour) return true;
    }
    return false;
  };

  const handleTimeClick = (time: number) => {
    if (isTimeDisabled(time)) return;

    if (selectedTimes.length === 0) {
      setSelectedTimes([time]);
      return;
    }
    if (selectedTimes.length > 1) {
      setSelectedTimes([time]);
      return;
    }

    const start = selectedTimes[0];
    if (time === start) {
      setSelectedTimes([]);
    } else if (time < start) {
      setSelectedTimes([time]);
    } else {
      const range = [];
      for (let t = start; t <= time; t++) {
        if (isTimeDisabled(t)) {
          alert('예약 불가능한 시간이 포함되어 있습니다.');
          return;
        }
        range.push(t);
      }
      setSelectedTimes(range);
    }
  };

  const formatTimeLabel = (time: number) => {
    const h = time.toString().padStart(2, '0');
    return `${h}:00`;
  };

  // --- 옵션 핸들러 ---
  const handleOptionCount = (idx: number, delta: number) => {
    const newOptions = [...options];
    const nextVal = newOptions[idx].count + delta;
    if (nextVal >= 0) {
      newOptions[idx].count = nextVal;
      setOptions(newOptions);
    }
  };

  // --- 결제 및 화면 이동 ---
  const hours = selectedTimes.length;
  const totalOptionCount = options.reduce((acc, cur) => acc + cur.count, 0);
  const totalPrice = hours * (hourlyPrice + totalOptionCount * OPTION_PRICE_PER_HOUR);

  const handlePayment = () => {
    if (hours === 0) {
      alert('시간을 선택해주세요.');
      return;
    }

    navigate('/payment', {
      state: {
        roomName,
        selectedDate,
        selectedTimes,
        personCount,
        totalPrice,
        options,
      },
    });
  };

  const renderTimeRow = (times: number[], label: string) => (
    <TimeRowContainer>
      <TimeLabelBadge>{label}</TimeLabelBadge>
      <TimeScrollArea>
        <TimeTrack>
          {times.map((t) => {
            const isDisabled = isTimeDisabled(t);
            const isSelected = selectedTimes.includes(t);
            return (
              <TimeBlock key={t} $isDisabled={isDisabled} $isSelected={isSelected} onClick={() => handleTimeClick(t)}>
                <span className='tick-label'>{formatTimeLabel(t + 1)}</span>
              </TimeBlock>
            );
          })}
        </TimeTrack>
      </TimeScrollArea>
    </TimeRowContainer>
  );

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        <HeaderTitle>날짜/시간 선택</HeaderTitle>
      </Header>

      <Content ref={contentRef}>
        <PageHeader>
          <PageTitle>{roomName}</PageTitle>
          <SubText>원하는 날짜와 시간을 선택해주세요.</SubText>
        </PageHeader>
        <Section>
          <CalendarHeader>
            <ArrowBtn onClick={handlePrevMonth}>&lt;</ArrowBtn>
            <MonthTitle>
              {year}년 {month + 1}월
            </MonthTitle>
            <ArrowBtn onClick={handleNextMonth}>&gt;</ArrowBtn>
          </CalendarHeader>

          <CalendarGrid>
            {['일', '월', '화', '수', '목', '금', '토'].map((d) => (
              <WeekDay key={d}>{d}</WeekDay>
            ))}
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const thisDate = new Date(year, month, day);
              const isPast = thisDate < today;
              const isSelected =
                !isPast &&
                thisDate.getDate() === selectedDate.getDate() &&
                thisDate.getMonth() === selectedDate.getMonth();
              return (
                <DayCell key={day} $isPast={isPast} $isSelected={isSelected} onClick={() => handleDateClick(day)}>
                  {day}
                </DayCell>
              );
            })}
          </CalendarGrid>
        </Section>
        <Divider />
        <Section style={{ position: 'relative' }}>
          <SectionTitleRow>
            <SectionTitle>시간 선택</SectionTitle>
            <Legend>
              <LegendItem>
                <div className='box gray' />
                <span>마감</span>
              </LegendItem>
              <LegendItem>
                <div className='box white' />
                <span>예약가능</span>
              </LegendItem>
            </Legend>
          </SectionTitleRow>

          <TimeSelectWrapper>
            {renderTimeRow(timesAM, '오전')}
            {renderTimeRow(timesPM, '오후')}
          </TimeSelectWrapper>
          <GuideText>* 시작 시간과 종료 시간을 누르면 범위가 선택됩니다.</GuideText>
        </Section>
        <Divider />
        <Section>
          <SectionTitle>기준 인원 선택</SectionTitle>
          <Row>
            <PersonInfo>
              <img src={IconPerson} alt='person' width={20} />
              <span className='count-text'>인원 {personCount}명</span>
            </PersonInfo>
            <CounterBox>
              <CountBtn onClick={() => setPersonCount((p) => Math.max(1, p - 1))}>−</CountBtn>
              <CountValue>{personCount}</CountValue>
              <CountBtn onClick={() => setPersonCount((p) => p + 1)}>+</CountBtn>
            </CounterBox>
          </Row>
        </Section>
        <Divider />
        <Section>
          <SectionTitle>옵션 선택</SectionTitle>
          <OptionList>
            {options.map((opt, idx) => (
              <OptionRow key={opt.name}>
                <OptionInfo>
                  <span className='name'>{opt.name}</span>
                  <span className='price'>시간당 {OPTION_PRICE_PER_HOUR.toLocaleString()}원</span>
                </OptionInfo>
                <CounterBox>
                  <CountBtn onClick={() => handleOptionCount(idx, -1)}>−</CountBtn>
                  <CountValue>{opt.count}</CountValue>
                  <CountBtn onClick={() => handleOptionCount(idx, 1)}>+</CountBtn>
                </CounterBox>
              </OptionRow>
            ))}
          </OptionList>
        </Section>
      </Content>

      <BottomBar>
        {selectedTimes.length > 0 ? (
          <SummaryBox>
            <SummaryItem>
              <span className='label'>날짜</span>
              <span className='val'>
                {selectedDate.getMonth() + 1}.{selectedDate.getDate()} (
                {['일', '월', '화', '수', '목', '금', '토'][selectedDate.getDay()]})
              </span>
            </SummaryItem>
            <VerticalLine />
            <SummaryItem>
              <span className='label'>시간</span>
              <span className='val'>
                {formatTimeLabel(selectedTimes[0])} ~ {formatTimeLabel(selectedTimes[selectedTimes.length - 1] + 1)}
              </span>
            </SummaryItem>
            <VerticalLine />
            <SummaryItem>
              <span className='label'>총 시간</span>
              <span className='val highlight'>{hours}시간</span>
            </SummaryItem>
          </SummaryBox>
        ) : (
          <EmptySummary>시간을 선택해주세요</EmptySummary>
        )}

        <PaymentArea>
          <div className='total-row'>
            <span className='label'>총 합계금액</span>
            <span className='price'>{totalPrice.toLocaleString()}원</span>
          </div>
          <PayBtn onClick={handlePayment} disabled={hours === 0}>
            예약하기
          </PayBtn>
        </PaymentArea>
      </BottomBar>
    </Container>
  );
}

// --- Styles ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #fff;
  /* 하단 바(80px) + BottomNav(64px) + 여유공간 */
  padding-bottom: 160px;
`;

const Header = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  margin-right: 12px;
`;

const HeaderTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const PageHeader = styled.div`
  padding: 16px 20px 0;
`;

const PageTitle = styled.h1`
  font-size: 20px;
  font-weight: 800;
  margin-bottom: 4px;
  color: #111;
`;

const SubText = styled.p`
  font-size: 13px;
  color: #888;
  margin-bottom: 16px;
`;

const Section = styled.div`
  padding: 16px 20px;
`;

const SectionTitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #111;
  margin-bottom: 12px;
`;

const Legend = styled.div`
  display: flex;
  gap: 12px;
  font-size: 11px;
  color: #666;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;

  .box {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    border: 1px solid #ddd;
  }
  .gray {
    background-color: #f0f0f0;
  }
  .white {
    background-color: #fff;
  }
`;

const Divider = styled.div`
  height: 8px;
  background-color: #f7f7f7;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 16px;
`;

const MonthTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: #333;
`;

const ArrowBtn = styled.button`
  background: transparent;
  border: none;
  font-size: 18px;
  color: #666;
  cursor: pointer;
  padding: 4px 8px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px 0;
  text-align: center;
`;

const WeekDay = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
`;

const DayCell = styled.div<{ $isSelected: boolean; $isPast: boolean }>`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  border-radius: 50%;
  margin: 0 auto;

  cursor: ${({ $isPast }) => ($isPast ? 'not-allowed' : 'pointer')};
  color: ${({ $isPast, $isSelected }) => ($isPast ? '#ccc' : $isSelected ? '#fff' : '#333')};
  background-color: ${({ $isSelected }) => ($isSelected ? theme.colors.primary : 'transparent')};

  &:hover {
    background-color: ${({ $isPast, $isSelected }) => !$isPast && !$isSelected && '#f0f0f0'};
  }
`;

const TimeSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const TimeRowContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const TimeLabelBadge = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #555;
`;

const TimeScrollArea = styled.div`
  width: 100%;
  overflow-x: auto;
  padding-bottom: 24px;
  padding-left: 10px;
  padding-right: 10px;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TimeTrack = styled.div`
  display: flex;
  min-width: max-content;
`;

const TimeBlock = styled.div<{ $isDisabled: boolean; $isSelected: boolean }>`
  width: 48px;
  height: 32px;
  border: 1px solid #ddd;
  margin-right: -1px;
  position: relative;

  cursor: ${({ $isDisabled }) => ($isDisabled ? 'not-allowed' : 'pointer')};
  background-color: ${({ $isDisabled, $isSelected }) =>
    $isDisabled ? '#f0f0f0' : $isSelected ? theme.colors.primary : '#fff'};

  &:first-child {
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  &:last-child {
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    margin-right: 0;
  }

  .tick-label {
    position: absolute;
    bottom: -22px;
    right: 0;
    transform: translateX(50%);

    font-size: 11px;
    color: #999;
    white-space: nowrap;
    pointer-events: none;
  }
`;

const GuideText = styled.p`
  font-size: 12px;
  color: #999;
  margin-top: 12px;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PersonInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  .count-text {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }
`;

const CounterBox = styled.div`
  display: flex;
  align-items: center;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 4px;
`;

const CountBtn = styled.button`
  width: 28px;
  height: 28px;
  border: none;
  background: #fff;
  border-radius: 6px;
  font-size: 16px;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

  &:active {
    background: #f0f0f0;
  }
`;

const CountValue = styled.div`
  font-size: 13px;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
  color: #333;
`;

const OptionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const OptionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  .name {
    font-size: 14px;
    color: #333;
  }
  .price {
    font-size: 11px;
    color: #888;
  }
`;

// ✅ 하단 네비게이션 높이(64px)만큼 위로 올림
const BottomBar = styled.div`
  position: fixed;
  bottom: 64px;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #eee;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  padding: 20px;
  z-index: 1000;
  max-width: 430px; /* MobileShell Frame 너비에 맞춤 */
  margin: 0 auto;
`;

const SummaryBox = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
`;

const SummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .label {
    font-size: 11px;
    color: #888;
  }
  .val {
    font-size: 13px;
    font-weight: 600;
    color: #333;
    &.highlight {
      color: ${theme.colors.primary};
    }
  }
`;

const VerticalLine = styled.div`
  width: 1px;
  height: 20px;
  background-color: #e0e0e0;
`;

const EmptySummary = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  font-size: 13px;
  color: #999;
  margin-bottom: 12px;
`;

const PaymentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;

    .label {
      font-size: 15px;
      font-weight: 700;
      color: #333;
    }
    .price {
      font-size: 20px;
      font-weight: 800;
      color: ${theme.colors.primary};
    }
  }
`;

const PayBtn = styled.button`
  width: 100%;
  height: 52px;
  background-color: ${({ disabled }) => (disabled ? '#ddd' : theme.colors.primary)};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};

  &:active {
    filter: ${({ disabled }) => (disabled ? 'none' : 'brightness(0.9)')};
  }
`;
