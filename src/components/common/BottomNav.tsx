import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import HomeIcon from '@/assets/icons/Icon_home.svg';
import CalendarIcon from '@/assets/icons/Icon_calendar.svg';
import PersonIcon from '@/assets/icons/Icon_person.svg';

const tabs = [
  { to: '/home', label: '홈', icon: HomeIcon },
  { to: '/reserve', label: '예약', icon: CalendarIcon },
  { to: '/my', label: 'MY', icon: PersonIcon },
];

export default function BottomNav() {
  return (
    <Bar>
      {tabs.map((t) => (
        <Tab key={t.to} to={t.to} className={({ isActive }) => (isActive ? 'active' : '')}>
          <NavIcon src={t.icon} alt={t.label} />
          <span>{t.label}</span>
        </Tab>
      ))}
    </Bar>
  );
}

const Bar = styled.nav`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 64px;
  background: ${({ theme }) => theme.colors.white || '#ffffff'};
  border-top: 1px solid ${({ theme }) => theme.colors.border || '#eeeeee'};

  /* ✅ [수정] Grid -> Flex 변경 및 space-between 적용 */
  display: flex;
  justify-content: space-between; /* 아이템 사이 간격 균등 배치 */
  align-items: center; /* 세로 중앙 정렬 */

  /* ✅ [수정] 좌우 여백을 주어 아이템이 너무 끝에 붙지 않게 함 */
  padding: 10px 50px;

  /* 아이폰 노치(하단 바) 대응 */
  z-index: 100;
`;

const Tab = styled(NavLink)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.subText || '#999999'};
  font-size: 12px;

  & img {
    transition: filter 0.2s;
    opacity: 0.5;
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary || '#000000'};
    font-weight: 700;

    & img {
      opacity: 1;
      filter: none;
    }
  }
`;

const NavIcon = styled.img`
  width: 24px;
  height: 24px;
  display: block;
`;
