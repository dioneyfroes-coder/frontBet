import mockData from './mock-data.json';

export type MockData = typeof mockData;

// Export the JSON as typed data for handlers to consume
export const data: MockData = mockData as unknown as MockData;

export default data;
