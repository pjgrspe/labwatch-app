// labwatch-app/utils/firebaseUtils.ts
import { Timestamp } from 'firebase/firestore';

export const convertTimestamps = (data: any): any => {
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Timestamp) {
    return data.toDate();
  }
  if (Array.isArray(data)) {
    return data.map(item => convertTimestamps(item));
  }
  const converted: { [key: string]: any } = {};
  for (const key in data) {
    if (Object.prototype.hasOwnProperty.call(data, key)) {
      converted[key] = convertTimestamps(data[key]);
    }
  }
  return converted;
};