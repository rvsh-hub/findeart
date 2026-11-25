import * as Location from 'expo-location';

/** The user's current city, or null if permission is denied or unknown. */
export async function currentCity(): Promise<string | null> {
  try {
    const perm = await Location.requestForegroundPermissionsAsync();
    if (!perm.granted) return null;
    const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    const [place] = await Location.reverseGeocodeAsync(pos.coords);
    return place?.city ?? place?.subregion ?? place?.region ?? null;
  } catch {
    return null;
  }
}
