export type RoomsApiItem = {
  id: string;
  name: string;
  address: string;
  pricePerHour: number;
  distanceKm: number;
  latitude: number;
  longitude: number;
  imageUrl: string;
  openStatus: string; // "영업 중 ･ 23:00에 영업 종료"
  rating: number;
  reviewCount: number;
  price?: string; // "14,000" (표시용 문자열)
};

export type RoomsApiResponse = {
  statusCode: number;
  message: string;
  data: RoomsApiItem[];
};

/** 지도/상세 UI에서 쓰기 좋은 형태로 정규화한 타입 */
export type Room = {
  id: string;
  name: string;
  address: string;
  pricePerHour: number;
  distanceKm: number;
  latitude: number;
  longitude: number;
  imageUrl: string;
  openStatus: string;
  rating: number;
  reviewCount: number;
  price?: string; // data.price 그대로
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export async function fetchRooms(): Promise<Room[]> {
  const res = await fetch(`${API_BASE}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) throw new Error(`fetchRooms failed: ${res.status}`);

  const json = (await res.json()) as RoomsApiResponse;

  if (!json?.data || !Array.isArray(json.data)) {
    throw new Error('Invalid response: missing data[]');
  }

  return json.data.map((r) => ({
    id: r.id,
    name: r.name,
    address: r.address,
    pricePerHour: r.pricePerHour,
    distanceKm: r.distanceKm,
    latitude: r.latitude,
    longitude: r.longitude,
    imageUrl: r.imageUrl,
    openStatus: r.openStatus,
    rating: r.rating,
    reviewCount: r.reviewCount,
    price: r.price, // "14,000"
  }));
}

/** 상세 API가 없으니 목록에서 id로 찾기 */
export async function fetchRoomById(id: string): Promise<Room | null> {
  const list = await fetchRooms();
  return list.find((x) => x.id === id) ?? null;
}
