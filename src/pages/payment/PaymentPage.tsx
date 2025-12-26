import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { useLocation, useNavigate } from 'react-router-dom';
import { theme } from '@/styles/theme';

// 아이콘 에셋 임포트
import IconCard from '@/assets/icons/Icon_payment.svg'; // 신용카드
import IconKakao from '@/assets/icons/icon_kakaotalk.svg'; // 카카오페이

export default function PaymentPage() {
  const contentRef = useRef<HTMLDivElement>(null);

  // ✅ [ReservePage와 동일] 페이지 진입 시 스크롤 초기화 로직
  useEffect(() => {
    if (history.scrollRestoration) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

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
  const { roomName, selectedDate, selectedTimes, personCount, totalPrice } = location.state || {};

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'kakao'>('card');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 날짜/시간 포맷팅
  const dateObj = selectedDate ? new Date(selectedDate) : new Date();
  const dateStr = `${dateObj.getMonth() + 1}월 ${dateObj.getDate()}일`;

  const timeStr =
    selectedTimes && selectedTimes.length > 0
      ? `${selectedTimes[0]}:00 ~ ${selectedTimes[selectedTimes.length - 1] + 1}:00`
      : '';

  const handlePay = () => {
    setIsModalOpen(true);
  };

  const handleModalConfirm = () => {
    setIsModalOpen(false);
    navigate('/'); // 홈으로 이동
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>←</BackButton>
        <HeaderTitle>결제하기</HeaderTitle>
      </Header>

      {/* ✅ [ReservePage와 동일] 내부 스크롤 영역 */}
      <ScrollContent ref={contentRef}>
        {/* 1. 예약 정보 */}
        <Section>
          <SectionTitle>예약 정보</SectionTitle>
          <InfoBox>
            <InfoRow>
              <span className='label'>합주실</span>
              <span className='value'>{roomName}</span>
            </InfoRow>
            <InfoRow>
              <span className='label'>일정</span>
              <span className='value'>
                {dateStr}, {timeStr}
              </span>
            </InfoRow>
            <InfoRow>
              <span className='label'>인원</span>
              <span className='value'>{personCount}명</span>
            </InfoRow>
          </InfoBox>
        </Section>

        <Divider />

        {/* 2. 결제 수단 */}
        <Section>
          <SectionTitle>결제 수단</SectionTitle>
          <PaymentMethods>
            <MethodCard $selected={paymentMethod === 'card'} onClick={() => setPaymentMethod('card')}>
              <RadioCircle $selected={paymentMethod === 'card'} />
              <MethodIcon src={IconCard} alt='card' />
              <MethodName>신용카드</MethodName>
            </MethodCard>

            <MethodCard $selected={paymentMethod === 'kakao'} onClick={() => setPaymentMethod('kakao')}>
              <RadioCircle $selected={paymentMethod === 'kakao'} />
              <MethodIcon src={IconKakao} alt='kakao' />
              <MethodName>카카오페이</MethodName>
            </MethodCard>
          </PaymentMethods>
        </Section>

        {/* ✅ [ReservePage와 동일] 하단 바에 가려지지 않게 여백 추가 */}
        <BottomSpacer />
      </ScrollContent>

      {/* ✅ [ReservePage와 동일] 하단 결제 바 */}
      <BottomBar>
        <PaymentArea>
          <div className='total-row'>
            <span className='label'>총 결제 금액</span>
            <span className='price'>{totalPrice?.toLocaleString()}원</span>
          </div>
          <PayBtn onClick={handlePay}>결제하기</PayBtn>
        </PaymentArea>
      </BottomBar>

      {/* 예약 완료 모달 */}
      {isModalOpen && (
        <ModalOverlay>
          <ModalContent>
            <CheckIconWrapper>
              <svg
                width='32'
                height='32'
                viewBox='0 0 24 24'
                fill='none'
                stroke='white'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
              >
                <polyline points='20 6 9 17 4 12' />
              </svg>
            </CheckIconWrapper>
            <ModalTitle>예약이 완료되었습니다!</ModalTitle>
            <ModalSubText>
              즐거운 합주 되세요.
              <br />
              예약 내역은 마이페이지에서 확인 가능합니다.
            </ModalSubText>
            <ModalButton onClick={handleModalConfirm}>확인</ModalButton>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
}

// --- Styles ---

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%; /* 부모 높이 꽉 채움 (MobileShell 기준) */
  background-color: #fff;
  position: relative;
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

// ✅ [ReservePage와 동일] 내부 스크롤 컨테이너
const ScrollContent = styled.div`
  flex: 1;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const Section = styled.div`
  padding: 24px 20px;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #111;
`;

const Divider = styled.div`
  height: 8px;
  background-color: #f7f7f7;
`;

const InfoBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  .label {
    color: #888;
  }
  .value {
    color: #333;
    font-weight: 500;
    text-align: right;
  }
`;

const PaymentMethods = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MethodCard = styled.div<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid ${({ $selected, theme }) => ($selected ? theme.colors.primary : '#eee')};
  border-radius: 12px;
  background-color: ${({ $selected }) => ($selected ? '#F4F2FF' : '#fff')};
  cursor: pointer;
  transition: all 0.2s;
`;

const RadioCircle = styled.div<{ $selected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ $selected, theme }) => ($selected ? theme.colors.primary : '#ccc')};
  margin-right: 16px;
  position: relative;
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: ${({ theme }) => theme.colors.primary};
    display: ${({ $selected }) => ($selected ? 'block' : 'none')};
  }
`;

const MethodIcon = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 12px;
  object-fit: contain;
`;

const MethodName = styled.span`
  font-size: 15px;
  color: #333;
  font-weight: 500;
`;

// ✅ [ReservePage와 동일] 하단 바 스타일
const BottomBar = styled.div`
  position: absolute; /* Container 기준 절대 위치 */
  bottom: 64px; /* 하단 탭바 높이 고려 */
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #eee;
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.08);
  padding: 20px;
  z-index: 1000;
`;

const PaymentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .total-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
    .label {
      font-size: 16px;
      font-weight: 700;
      color: #333;
    }
    .price {
      font-size: 22px;
      font-weight: 800;
      color: ${theme.colors.primary};
    }
  }
`;

const PayBtn = styled.button`
  width: 100%;
  height: 52px;
  background-color: ${theme.colors.primary};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: opacity 0.2s;

  &:active {
    opacity: 0.9;
  }
`;

// ✅ [ReservePage와 동일] 하단 스페이서
const BottomSpacer = styled.div`
  height: 200px;
`;

// --- Modal Styles ---

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: ${fadeIn} 0.2s ease-out;
  max-width: 430px;
  margin: 0 auto;
`;

const ModalContent = styled.div`
  background: white;
  width: 100%;
  max-width: 320px;
  border-radius: 20px;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  animation: ${slideUp} 0.3s ease-out;
`;

const CheckIconWrapper = styled.div`
  width: 60px;
  height: 60px;
  background-color: ${theme.colors.primary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
`;

const ModalTitle = styled.h2`
  font-size: 20px;
  font-weight: 800;
  color: #111;
  margin-bottom: 12px;
`;

const ModalSubText = styled.p`
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 28px;
`;

const ModalButton = styled.button`
  width: 100%;
  height: 48px;
  background-color: ${theme.colors.primary};
  color: white;
  font-size: 16px;
  font-weight: 700;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  &:active {
    filter: brightness(0.9);
  }
`;
