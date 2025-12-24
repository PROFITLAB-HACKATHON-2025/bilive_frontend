export type Rooms = {
    id: string;
    name: string;
    address: string;
    pricePerHour: number;
    distanceKm: number;
};

const MOCK: Rooms[] = [
    { id: "1", name: "빌리브 합주실 홍대점", address: "마포구 어딘가 123", pricePerHour: 22000, distanceKm: 1.2 },
    { id: "2", name: "사운드룸 연남", address: "마포구 어딘가 456", pricePerHour: 18000, distanceKm: 2.3 },
    { id: "3", name: "밴드메이트 스튜디오", address: "서대문구 어딘가 789", pricePerHour: 25000, distanceKm: 3.1 },
];

export async function fetchRooms(): Promise<Rooms[]> {
    await new Promise((r) => setTimeout(r, 250));
    return MOCK;
}

export async function fetchRoomById(id: string): Promise<Rooms | null> {
    await new Promise((r) => setTimeout(r, 150));
    return MOCK.find((x) => x.id === id) ?? null;
}