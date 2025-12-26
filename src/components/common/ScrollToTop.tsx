import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. 브라우저의 기본 스크롤 복원 기능 끄기 (수동 제어)
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = 'manual';
    }

    // 2. 윈도우 스크롤 즉시 0으로 이동
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;

    // 3. MobileShell 등 상위 컨테이너가 있다면 해당 요소도 초기화 (ID가 'root'나 'mobile-shell'인 경우 등)
    // 필요 시 아래 주석 해제 후 ID에 맞게 수정하여 사용하세요.
    // document.getElementById('root')?.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
