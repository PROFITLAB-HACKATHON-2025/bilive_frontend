import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useQuery } from '@tanstack/react-query';
import { fetchRoomById } from '@/api/rooms';

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const nav = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['room', roomId],
    queryFn: () => fetchRoomById(roomId!),
    enabled: !!roomId,
  });

  return (
    <>
      <TopBar>
        <Back onClick={() => nav(-1)}>←</Back>
        <Title>합주실 상세</Title>
        <Spacer />
      </TopBar>

      {isLoading ? (
        // 로딩 중일 때는 회색 박스(스켈레톤)를 보여줌
        <>
          <SkeletonHero />
          <Hint>불러오는 중…</Hint>
        </>
      ) : !data ? (
        <Hint>해당 합주실을 찾을 수 없어요.</Hint>
      ) : (
        <>
          <Hero src={data.imageUrl} alt={data.name} />

          <Name>{data.name}</Name>
          <Meta>{data.address}</Meta>
          <Meta>
            {data.distanceKm}km · {data.pricePerHour.toLocaleString()}원/시간
          </Meta>

          <PrimaryBtn onClick={() => nav('/reserve')}>예약하러 가기(임시)</PrimaryBtn>
        </>
      )}
    </>
  );
}

/**
 * 스타일 컴포넌트
 */

const TopBar = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr 44px;
  align-items: center;
  margin-bottom: 12px;
`;

const Back = styled.button`
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
`;

const Title = styled.h1`
  text-align: center;
  font-weight: 800;
  font-size: 16px;
  margin: 0;
`;

const Spacer = styled.div`
  width: 44px;
`;

const Hero = styled.img`
  display: block;
  width: 100%;
  height: 200px; /* 고정 높이 */
  border-radius: 16px;
  object-fit: cover;
  background-color: #f0f0f0;
  border: 1px solid ${({ theme }) => theme.colors.border || '#eee'};
`;

const SkeletonHero = styled.div`
  width: 100%;
  height: 200px;
  border-radius: 16px;
  background-color: #f5f5f5;
`;

const Name = styled.h2`
  margin-top: 20px;
  font-size: 22px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.text};
`;

const Meta = styled.div`
  margin-top: 8px;
  color: ${({ theme }) => theme.colors.subText};
  font-size: 14px;
`;

const Hint = styled.p`
  margin-top: 24px;
  color: ${({ theme }) => theme.colors.subText || '#999'};
  text-align: center;
`;

const PrimaryBtn = styled.button`
  margin-top: 32px;
  width: 100%;
  height: 54px;
  border-radius: 14px;
  border: 0;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;

  &:active {
    filter: brightness(0.9);
  }
`;
