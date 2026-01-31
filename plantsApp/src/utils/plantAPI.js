const API_TOKEN = 'usr-fPbyC5hDq8G1NuQiaB_Ml12H0YL1tsj9tcntMlB9iyA';
const BASE_URL = 'https://trefle.io/api/v1/plants/search';

export async function fetchPlantData(scientificName) {
  try {
    const response = await fetch(`${BASE_URL}?q=${encodeURIComponent(scientificName)}&token=${API_TOKEN}`);
    const json = await response.json();

    if (json.data && json.data.length > 0) {
      // Tomamos el primer resultado
      const plant = json.data[0];
      return {
        family: plant.family_common_name || plant.family,
        genus: plant.genus,
        commonName: plant.common_name,
        type: plant.specifications?.growth_form,
        origin: plant.distribution?.native || 'Desconocido',
        image: plant.image_url
      };
    }

    return null;
  } catch (e) {
    console.error('Error fetching plant data:', e);
    return null;
  }
}