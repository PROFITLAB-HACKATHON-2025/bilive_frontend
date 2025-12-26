import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    kakao: any;
  }
}

type LatLng = { lat: number; lng: number };

let kakaoScriptLoading: Promise<void> | null = null;

function loadKakaoMapScript(appKey: string) {
  if (kakaoScriptLoading) return kakaoScriptLoading;

  kakaoScriptLoading = new Promise<void>((resolve, reject) => {
    if (window.kakao?.maps) return resolve();

    const existing = document.querySelector('script[data-kakao-map="true"]') as HTMLScriptElement | null;
    if (existing) {
      // 이미 붙어있는 script가 있고 로드중/로드완료일 수 있음
      if (window.kakao?.maps) return resolve();
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Kakao map script load error')));
      return;
    }

    const script = document.createElement('script');
    script.dataset.kakaoMap = 'true';
    script.async = true;

    // services/clusterer는 나중에 쓸 가능성 높아서 기본 포함
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appKey}&autoload=false&libraries=services,clusterer`;

    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Kakao map script load error'));
    document.head.appendChild(script);
  });

  return kakaoScriptLoading;
}

type UseKakaoMapOptions = {
  appKey: string;
  center: LatLng;
  level?: number;
  onIdle?: (map: any) => void; // bounds 기반 렌더링 등에 사용
};

export function useKakaoMap({ appKey, center, level = 5, onIdle }: UseKakaoMapOptions) {
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!appKey) {
      setError(new Error('VITE_KAKAO_MAP_KEY is missing'));
      return;
    }

    let mounted = true;

    loadKakaoMapScript(appKey)
      .then(() => {
        if (!mounted) return;

        window.kakao.maps.load(() => {
          if (!mounted) return;

          if (!mapElRef.current) return;

          const map = new window.kakao.maps.Map(mapElRef.current, {
            center: new window.kakao.maps.LatLng(center.lat, center.lng),
            level,
          });

          mapRef.current = map;
          setReady(true);

          if (onIdle) {
            window.kakao.maps.event.addListener(map, 'idle', () => onIdle(map));
          }
        });
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e instanceof Error ? e : new Error(String(e)));
      });

    return () => {
      mounted = false;
    };
    // center/level 변경으로 새 map을 만들고 싶지 않아서 의존성 최소화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appKey]);

  const panTo = (pos: LatLng) => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;
    map.panTo(new window.kakao.maps.LatLng(pos.lat, pos.lng));
  };

  const setCenter = (pos: LatLng) => {
    const map = mapRef.current;
    if (!map || !window.kakao?.maps) return;
    map.setCenter(new window.kakao.maps.LatLng(pos.lat, pos.lng));
  };

  const getMap = () => mapRef.current;

  return { mapElRef, ready, error, panTo, setCenter, getMap };
}
