import { NavLink } from "react-router-dom";
import styled from "styled-components";

const tabs = [
    { to: "/home", label: "홈" },
    { to: "/reserve", label: "예약" },
    { to: "/community", label: "커뮤니티" },
    { to: "/my", label: "MY" },
];

export default function BottomNav() {
    return (
        <Bar>
            {tabs.map((t) => (
                <Tab
                    key={t.to}
                    to={t.to}
                    className={({ isActive }) => (isActive ? "active" : "")}
                >
                    <Dot />
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
  /* theme 객체가 올바르게 설정되어 있어야 합니다 */
  background: ${({ theme }) => theme.colors.white || "#ffffff"};
  border-top: 1px solid ${({ theme }) => theme.colors.border || "#eeeeee"};
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  
  /* 아이폰 노치(하단 바) 대응 */
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 100;
`;

const Tab = styled(NavLink)`
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.subText || "#999999"};
  font-size: 12px;

  &.active {
    color: ${({ theme }) => theme.colors.primary || "#000000"};
    font-weight: 700;
  }
`;

const Dot = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.chip || "#f0f0f0"};
`;