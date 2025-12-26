import { useNavigate } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import IconStar from '@/assets/icons/Icon_star.svg';
import RoomImage from '@/assets/images/bandroom1.png';
import { theme } from '@/styles/theme'; // 요청하신 테마 파일 import

// 장비 타입 정의
type Equipment = {
  category: string;
  name: string;
};

// 합주실 타입 정의
type SubRoom = {
  id: number;
  name: string;
  type: string; // (표준), (대형) 등
  capacity: number;
  price: number;
};

export default function RoomDetailPage() {
  const nav = useNavigate();

  // 더미 데이터
  const roomDetail = {
    name: '비쥬 합주실 3호점',
    score: 4.9,
    reviewCount: 12,
    address: '서울 마포구 와우산로 11길 9 B1',
    notice: `24시간 운영(야간 무인), 물/음료 외 음식물 반입 금지입니다.
퇴실 시 냉난방기 OFF 및 장비 파손 주의 부탁드립니다.`,

    // 장비 데이터
    equipments: [
      { category: '드럼', name: 'Yamaha Maple Custom' },
      { category: '키보드', name: 'Kurzweil SP6' },
      { category: '키보드', name: 'Yamaha CP88' },
      { category: '기타 앰프', name: 'Marshall JCM2000' },
      { category: '기타 앰프', name: 'Fender Twin Reverb' },
      { category: '베이스 앰프', name: 'Ampeg SVT-4PRO' },
      { category: '마이크', name: 'Shure SM58 x 4' },
      { category: '스피커', name: 'JBL EON615' },
    ] as Equipment[],

    // 합주실 목록
    subRooms: [
      { id: 1, name: 'A Room', type: '(표준)', capacity: 4, price: 12000 },
      { id: 2, name: 'B Room', type: '(표준)', capacity: 5, price: 15000 },
      { id: 3, name: 'C Room', type: '(대형)', capacity: 12, price: 22000 },
    ] as SubRoom[],
  };

  const handleReserve = (subRoom: SubRoom) => {
    nav('/reserve', {
      state: {
        roomName: `${roomDetail.name} - ${subRoom.name}`,
        hourlyPrice: subRoom.price,
      },
    });
  };

  return (
    <Container>
      {/* 이 페이지에서만 body 마진 제거 */}
      <GlobalBodyStyle />

      {/* 상단 이미지 */}
      <HeaderImage>
        <img src={RoomImage} alt='Room' />
        <BackButton onClick={() => nav(-1)}>←</BackButton>
      </HeaderImage>

      <Content>
        {/* 타이틀 */}
        <TitleSection>
          <RoomName>{roomDetail.name}</RoomName>
          <ScoreRow>
            <img src={IconStar} alt='star' width={14} />
            <span className='score'>{roomDetail.score}</span>
            <span className='count'>({roomDetail.reviewCount})</span>
          </ScoreRow>
          <AddressText>{roomDetail.address}</AddressText>
        </TitleSection>

        <Divider />

        {/* 사장님 공지 */}
        <Section>
          <SectionTitle>사장님 공지</SectionTitle>
          <NoticeBox>
            <NoticeText>{roomDetail.notice}</NoticeText>
          </NoticeBox>
        </Section>

        <Divider />

        {/* 장비 시설 (더보기 없이 전체 노출) */}
        <Section>
          <SectionTitle>장비 시설</SectionTitle>
          <EquipmentGrid>
            {roomDetail.equipments.map((item, idx) => (
              <EquipmentItem key={idx}>
                <span className='category'>{item.category}</span>
                <span className='name'>{item.name}</span>
              </EquipmentItem>
            ))}
          </EquipmentGrid>
        </Section>

        <Divider />

        {/* 합주실 선택 */}
        <Section>
          <SectionTitle>합주실 선택</SectionTitle>
          <SubRoomList>
            {roomDetail.subRooms.map((room) => (
              <SubRoomCard key={room.id}>
                <RoomInfo>
                  <div className='top-row'>
                    <span className='room-name'>{room.name}</span>
                    <span className='room-type'>{room.type}</span>
                  </div>
                  <div className='meta-row'>
                    <span className='capacity'>최대 {room.capacity}인</span>
                  </div>
                  <div className='price-row'>
                    <span className='price'>{room.price.toLocaleString()}원</span>
                    <span className='unit'>/ 시</span>
                  </div>
                </RoomInfo>

                <ReserveButton onClick={() => handleReserve(room)}>예약하기</ReserveButton>
              </SubRoomCard>
            ))}
          </SubRoomList>
        </Section>
      </Content>
    </Container>
  );
}

/** Styles */

// 전역 스타일 오버라이드: 이 컴포넌트가 렌더링될 때 body 마진을 0으로 강제함
const GlobalBodyStyle = createGlobalStyle`
  body {
    margin: 0 !important;
    padding: 0 !important;
  }
`;

const Container = styled.div`
  background-color: ${theme.colors.white};
  min-height: 100vh;
  padding-bottom: 40px;
  width: 100%;
`;

const HeaderImage = styled.div`
  width: 100%;
  height: 220px;
  position: relative;
  background-color: #ddd;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const BackButton = styled.button`
  position: absolute;
  top: 16px;
  left: 16px;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.4);
  border: none;
  color: ${theme.colors.white};
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Content = styled.div`
  padding: 20px;
`;

const TitleSection = styled.div`
  margin-bottom: 16px;
`;

const RoomName = styled.h1`
  font-size: 22px;
  font-weight: 800;
  color: ${theme.colors.text};
  margin-bottom: 6px;
`;

const ScoreRow = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  margin-bottom: 6px;

  .score {
    font-weight: 700;
    color: ${theme.colors.text};
  }
  .count {
    color: ${theme.colors.subText}; // #6B7280
  }
`;

const AddressText = styled.div`
  font-size: 13px;
  color: #666;
`;

const Divider = styled.div`
  height: 8px;
  background-color: #f7f7f7;
  margin: 0 -20px 20px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  margin-bottom: 12px;
  color: ${theme.colors.text};
`;

const NoticeBox = styled.div`
  background-color: #fffafa;
  border: 1px solid #ffebeb;
  padding: 14px;
  border-radius: 12px;
`;

const NoticeText = styled.pre`
  font-size: 13px;
  line-height: 1.5;
  color: #444;
  white-space: pre-wrap;
  font-family: inherit;
  margin: 0;
`;

// --- 장비 섹션 ---
const EquipmentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;
`;

const EquipmentItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;

  .category {
    font-size: 12px;
    color: ${theme.colors.subText};
  }
  .name {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }
`;

// --- 합주실 선택 ---
const SubRoomList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const SubRoomCard = styled.div`
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  padding: 14px 14px 14px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${theme.colors.white};
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;

  .top-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;

    .room-name {
      font-size: 16px;
      font-weight: 700;
      color: #222;
    }
    .room-type {
      font-size: 13px;
      color: ${theme.colors.subText};
      font-weight: 500;
    }
  }

  .meta-row {
    margin-bottom: 6px;
    .capacity {
      font-size: 12px;
      color: ${theme.colors.subText};
    }
  }

  .price-row {
    display: flex;
    align-items: baseline;
    gap: 2px;

    .price {
      font-size: 16px;
      font-weight: 800;
      color: ${theme.colors.text};
    }
    .unit {
      font-size: 12px;
      color: #555;
    }
  }
`;

const ReserveButton = styled.button`
  background-color: ${theme.colors.primary}; /* 테마 컬러 적용 (#6D5EF8) */
  color: ${theme.colors.white};
  border: none;
  padding: 9px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;

  &:active {
    filter: brightness(0.9);
  }
`;
