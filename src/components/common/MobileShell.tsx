import type { ReactNode } from 'react';
import styled from 'styled-components';
import BottomNav from '@/components/common/BottomNav';

export default function MobileShell({ children }: { children: ReactNode }) {
  return (
    <Background>
      <Frame>
        <Content>{children}</Content>
        <BottomNav />
      </Frame>
    </Background>
  );
}

// 배경색을 주어 모바일 프레임을 돋보이게 함
const Background = styled.div`
  background-color: #f5f5f5;
  min-height: 100vh;
  display: flex;
  justify-content: center;
`;

const Frame = styled.div`
  /* 모바일 표준 너비 설정 */
  width: 100%;
  max-width: 430px;

  /* 높이 설정 */
  height: 100dvh;
  background-color: ${({ theme }) => theme.colors.white || '#ffffff'};

  /* 레이아웃 */
  display: flex;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05); /* PC에서 경계선 구분 */
`;

const Content = styled.main`
  flex: 1;
  overflow-y: auto;

  /* 스크롤바 숨기기 (선택 사항) */
  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;
