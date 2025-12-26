export type Rooms = {
  id: string;
  name: string;
  address: string;
  pricePerHour: number;
  distanceKm: number;
  imageUrl: string;
};

const rawImages = import.meta.glob('@/assets/images/bandroom*.{png,jpg,jpeg}', { eager: true, import: 'default' });

const images: Record<string, string> = {};

Object.entries(rawImages).forEach(([path, module]) => {
  // path 예시: "/src/assets/images/bandroom10.jpeg"
  // 정규식으로 'bandroom' 뒤의 숫자 추출
  const match = path.match(/bandroom(\d+)\./);
  if (match) {
    const number = match[1];
    images[number] = module as string;
  }
});

const ROOM_DATA = [
  // 마포구 (홍대/합정/망원)
  { id: '1', name: '빌리브 합주실 홍대점', address: '서울 마포구 와우산로 123', pricePerHour: 22000, distanceKm: 0.5 },
  { id: '2', name: '사운드팩토리 합정', address: '서울 마포구 양화로 45', pricePerHour: 18000, distanceKm: 0.8 },
  { id: '3', name: '리얼 합주실 망원', address: '서울 마포구 월드컵로 100', pricePerHour: 15000, distanceKm: 1.2 },
  { id: '4', name: '그루브 스튜디오 서교', address: '서울 마포구 잔다리로 60', pricePerHour: 20000, distanceKm: 0.6 },
  { id: '5', name: '퍼즐 스튜디오', address: '서울 마포구 독막로 88', pricePerHour: 17000, distanceKm: 0.9 },
  { id: '6', name: '홍대 V-Hall 연습실', address: '서울 마포구 홍익로 25', pricePerHour: 25000, distanceKm: 0.4 },

  // 서대문구 (신촌/연희)
  { id: '7', name: '신촌 뮤직스페이스', address: '서울 서대문구 연세로 30', pricePerHour: 14000, distanceKm: 1.5 },
  { id: '8', name: '연희 사운드랩', address: '서울 서대문구 연희맛로 12', pricePerHour: 16000, distanceKm: 1.8 },

  // 강남구/서초구 (강남/논현/신사)
  {
    id: '9',
    name: '제이콥스 스튜디오 강남',
    address: '서울 강남구 테헤란로 150',
    pricePerHour: 30000,
    distanceKm: 5.2,
  },
  { id: '10', name: '논현 드림박스', address: '서울 강남구 학동로 200', pricePerHour: 22000, distanceKm: 4.8 },
  { id: '11', name: '신사 잼세션 스튜디오', address: '서울 강남구 도산대로 110', pricePerHour: 28000, distanceKm: 5.5 },
  { id: '12', name: '서초 뮤직 아지트', address: '서울 서초구 남부순환로 2400', pricePerHour: 19000, distanceKm: 6.1 },

  // 동작구/관악구 (사당/이수/낙성대)
  { id: '13', name: '사당 오렌지 합주실', address: '서울 동작구 동작대로 55', pricePerHour: 15000, distanceKm: 3.5 },
  { id: '14', name: '이수 역세권 연습실', address: '서울 동작구 사당로 300', pricePerHour: 13000, distanceKm: 3.8 },
  { id: '15', name: '낙성대 소리공간', address: '서울 관악구 남부순환로 1900', pricePerHour: 12000, distanceKm: 4.2 },

  // 광진구 (건대/구의)
  { id: '16', name: '건대 악퉁 스테이션', address: '서울 광진구 아차산로 220', pricePerHour: 18000, distanceKm: 7.0 },
  { id: '17', name: '구의 뮤직플랜트', address: '서울 광진구 자양로 150', pricePerHour: 15000, distanceKm: 7.5 },

  // 종로구/중구 (혜화/을지로)
  { id: '18', name: '대학로 아트센터 연습실', address: '서울 종로구 대학로 100', pricePerHour: 16000, distanceKm: 4.5 },
  { id: '19', name: '을지로 힙스터 사운드', address: '서울 중구 을지로 120', pricePerHour: 20000, distanceKm: 3.2 },

  // 영등포구 (당산/문래)
  { id: '20', name: '문래 창작촌 합주실', address: '서울 영등포구 도림로 400', pricePerHour: 17000, distanceKm: 3.0 },
];

const MOCK: Rooms[] = ROOM_DATA.map((room) => ({
  ...room,
  imageUrl: images[room.id] || images['1'],
}));

export async function fetchRooms(): Promise<Rooms[]> {
  await new Promise((r) => setTimeout(r, 250));
  return MOCK;
}

export async function fetchRoomById(id: string): Promise<Rooms | null> {
  await new Promise((r) => setTimeout(r, 150));
  return MOCK.find((x) => x.id === id) ?? null;
}
