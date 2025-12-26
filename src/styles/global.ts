import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  /* 1. body 마진 제거 (필수) */
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Pretendard', sans-serif; /* 사용 중인 폰트 적용 */
    
    /* 모바일 웹앱 느낌을 위해 스크롤 바운스 제거 (선택 사항) */
    overscroll-behavior-y: none; 
  }

  /* 2. 모든 요소에 box-sizing 적용 (레이아웃 계산 편의) */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  /* 3. 링크, 버튼 기본 스타일 초기화 (선택 사항) */
  a {
    text-decoration: none;
    color: inherit;
  }
  
  button {
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
  }
`;
