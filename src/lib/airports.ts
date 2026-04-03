export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
}

// Top airports bundled for autocomplete — no external API needed
const AIRPORTS: Airport[] = [
  { code: 'ATL', city: 'Atlanta', name: 'Hartsfield-Jackson Atlanta Intl', country: 'US' },
  { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles Intl', country: 'US' },
  { code: 'ORD', city: 'Chicago', name: "O'Hare Intl", country: 'US' },
  { code: 'DFW', city: 'Dallas', name: 'Dallas/Fort Worth Intl', country: 'US' },
  { code: 'DEN', city: 'Denver', name: 'Denver Intl', country: 'US' },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy Intl', country: 'US' },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco Intl', country: 'US' },
  { code: 'SEA', city: 'Seattle', name: 'Seattle-Tacoma Intl', country: 'US' },
  { code: 'LAS', city: 'Las Vegas', name: 'Harry Reid Intl', country: 'US' },
  { code: 'MCO', city: 'Orlando', name: 'Orlando Intl', country: 'US' },
  { code: 'EWR', city: 'Newark', name: 'Newark Liberty Intl', country: 'US' },
  { code: 'MIA', city: 'Miami', name: 'Miami Intl', country: 'US' },
  { code: 'CLT', city: 'Charlotte', name: 'Charlotte Douglas Intl', country: 'US' },
  { code: 'PHX', city: 'Phoenix', name: 'Phoenix Sky Harbor Intl', country: 'US' },
  { code: 'IAH', city: 'Houston', name: 'George Bush Intercontinental', country: 'US' },
  { code: 'BOS', city: 'Boston', name: 'Boston Logan Intl', country: 'US' },
  { code: 'MSP', city: 'Minneapolis', name: 'Minneapolis-St Paul Intl', country: 'US' },
  { code: 'DTW', city: 'Detroit', name: 'Detroit Metropolitan Wayne County', country: 'US' },
  { code: 'FLL', city: 'Fort Lauderdale', name: 'Fort Lauderdale-Hollywood Intl', country: 'US' },
  { code: 'PHL', city: 'Philadelphia', name: 'Philadelphia Intl', country: 'US' },
  { code: 'LGA', city: 'New York', name: 'LaGuardia', country: 'US' },
  { code: 'BWI', city: 'Baltimore', name: 'Baltimore/Washington Intl', country: 'US' },
  { code: 'SLC', city: 'Salt Lake City', name: 'Salt Lake City Intl', country: 'US' },
  { code: 'DCA', city: 'Washington', name: 'Ronald Reagan Washington National', country: 'US' },
  { code: 'IAD', city: 'Washington', name: 'Washington Dulles Intl', country: 'US' },
  { code: 'SAN', city: 'San Diego', name: 'San Diego Intl', country: 'US' },
  { code: 'TPA', city: 'Tampa', name: 'Tampa Intl', country: 'US' },
  { code: 'PDX', city: 'Portland', name: 'Portland Intl', country: 'US' },
  { code: 'HNL', city: 'Honolulu', name: 'Daniel K. Inouye Intl', country: 'US' },
  { code: 'AUS', city: 'Austin', name: 'Austin-Bergstrom Intl', country: 'US' },
  { code: 'DAL', city: 'Dallas', name: 'Dallas Love Field', country: 'US' },
  { code: 'STL', city: 'St. Louis', name: 'St. Louis Lambert Intl', country: 'US' },
  { code: 'BNA', city: 'Nashville', name: 'Nashville Intl', country: 'US' },
  { code: 'RDU', city: 'Raleigh', name: 'Raleigh-Durham Intl', country: 'US' },
  { code: 'MDW', city: 'Chicago', name: 'Chicago Midway Intl', country: 'US' },
  { code: 'SMF', city: 'Sacramento', name: 'Sacramento Intl', country: 'US' },
  { code: 'SJC', city: 'San Jose', name: 'San Jose Intl', country: 'US' },
  { code: 'OAK', city: 'Oakland', name: 'Oakland Intl', country: 'US' },
  { code: 'RSW', city: 'Fort Myers', name: 'Southwest Florida Intl', country: 'US' },
  { code: 'CLE', city: 'Cleveland', name: 'Cleveland Hopkins Intl', country: 'US' },
  { code: 'PIT', city: 'Pittsburgh', name: 'Pittsburgh Intl', country: 'US' },
  { code: 'IND', city: 'Indianapolis', name: 'Indianapolis Intl', country: 'US' },
  { code: 'MCI', city: 'Kansas City', name: 'Kansas City Intl', country: 'US' },
  { code: 'CMH', city: 'Columbus', name: 'John Glenn Columbus Intl', country: 'US' },
  { code: 'OGG', city: 'Maui', name: 'Kahului', country: 'US' },
  { code: 'MSY', city: 'New Orleans', name: 'Louis Armstrong New Orleans Intl', country: 'US' },
  { code: 'SNA', city: 'Santa Ana', name: 'John Wayne Airport', country: 'US' },
  { code: 'JAX', city: 'Jacksonville', name: 'Jacksonville Intl', country: 'US' },
  { code: 'MKE', city: 'Milwaukee', name: 'Milwaukee Mitchell Intl', country: 'US' },
  { code: 'ONT', city: 'Ontario', name: 'Ontario Intl', country: 'US' },
  // International
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'GB' },
  { code: 'LGW', city: 'London', name: 'Gatwick', country: 'GB' },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'FR' },
  { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt', country: 'DE' },
  { code: 'AMS', city: 'Amsterdam', name: 'Schiphol', country: 'NL' },
  { code: 'MAD', city: 'Madrid', name: 'Adolfo Suarez Madrid-Barajas', country: 'ES' },
  { code: 'BCN', city: 'Barcelona', name: 'Barcelona-El Prat', country: 'ES' },
  { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci-Fiumicino', country: 'IT' },
  { code: 'MXP', city: 'Milan', name: 'Malpensa', country: 'IT' },
  { code: 'IST', city: 'Istanbul', name: 'Istanbul', country: 'TR' },
  { code: 'DXB', city: 'Dubai', name: 'Dubai Intl', country: 'AE' },
  { code: 'DOH', city: 'Doha', name: 'Hamad Intl', country: 'QA' },
  { code: 'SIN', city: 'Singapore', name: 'Changi', country: 'SG' },
  { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong Intl', country: 'HK' },
  { code: 'NRT', city: 'Tokyo', name: 'Narita Intl', country: 'JP' },
  { code: 'HND', city: 'Tokyo', name: 'Haneda', country: 'JP' },
  { code: 'ICN', city: 'Seoul', name: 'Incheon Intl', country: 'KR' },
  { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith', country: 'AU' },
  { code: 'MEL', city: 'Melbourne', name: 'Melbourne', country: 'AU' },
  { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson Intl', country: 'CA' },
  { code: 'YVR', city: 'Vancouver', name: 'Vancouver Intl', country: 'CA' },
  { code: 'MEX', city: 'Mexico City', name: 'Benito Juarez Intl', country: 'MX' },
  { code: 'CUN', city: 'Cancun', name: 'Cancun Intl', country: 'MX' },
  { code: 'GRU', city: 'Sao Paulo', name: 'Guarulhos Intl', country: 'BR' },
  { code: 'EZE', city: 'Buenos Aires', name: 'Ministro Pistarini Intl', country: 'AR' },
  { code: 'BOG', city: 'Bogota', name: 'El Dorado Intl', country: 'CO' },
  { code: 'LIM', city: 'Lima', name: 'Jorge Chavez Intl', country: 'PE' },
  { code: 'SCL', city: 'Santiago', name: 'Arturo Merino Benitez Intl', country: 'CL' },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', country: 'TH' },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'Kuala Lumpur Intl', country: 'MY' },
  { code: 'DEL', city: 'Delhi', name: 'Indira Gandhi Intl', country: 'IN' },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Intl', country: 'IN' },
  { code: 'CPT', city: 'Cape Town', name: 'Cape Town Intl', country: 'ZA' },
  { code: 'JNB', city: 'Johannesburg', name: 'OR Tambo Intl', country: 'ZA' },
  { code: 'CAI', city: 'Cairo', name: 'Cairo Intl', country: 'EG' },
  { code: 'ADD', city: 'Addis Ababa', name: 'Bole Intl', country: 'ET' },
  { code: 'NBO', city: 'Nairobi', name: 'Jomo Kenyatta Intl', country: 'KE' },
  { code: 'ZRH', city: 'Zurich', name: 'Zurich', country: 'CH' },
  { code: 'VIE', city: 'Vienna', name: 'Vienna Intl', country: 'AT' },
  { code: 'MUC', city: 'Munich', name: 'Munich', country: 'DE' },
  { code: 'CPH', city: 'Copenhagen', name: 'Copenhagen', country: 'DK' },
  { code: 'OSL', city: 'Oslo', name: 'Oslo Gardermoen', country: 'NO' },
  { code: 'ARN', city: 'Stockholm', name: 'Stockholm Arlanda', country: 'SE' },
  { code: 'HEL', city: 'Helsinki', name: 'Helsinki-Vantaa', country: 'FI' },
  { code: 'DUB', city: 'Dublin', name: 'Dublin', country: 'IE' },
  { code: 'LIS', city: 'Lisbon', name: 'Humberto Delgado', country: 'PT' },
  { code: 'ATH', city: 'Athens', name: 'Eleftherios Venizelos', country: 'GR' },
  { code: 'WAW', city: 'Warsaw', name: 'Warsaw Chopin', country: 'PL' },
  { code: 'PRG', city: 'Prague', name: 'Vaclav Havel', country: 'CZ' },
  { code: 'BUD', city: 'Budapest', name: 'Budapest Ferenc Liszt', country: 'HU' },
  { code: 'MAN', city: 'Manchester', name: 'Manchester', country: 'GB' },
  { code: 'EDI', city: 'Edinburgh', name: 'Edinburgh', country: 'GB' },
  { code: 'BRU', city: 'Brussels', name: 'Brussels', country: 'BE' },
  { code: 'PEK', city: 'Beijing', name: 'Beijing Capital Intl', country: 'CN' },
  { code: 'PVG', city: 'Shanghai', name: 'Shanghai Pudong Intl', country: 'CN' },
  { code: 'TPE', city: 'Taipei', name: 'Taiwan Taoyuan Intl', country: 'TW' },
  { code: 'MNL', city: 'Manila', name: 'Ninoy Aquino Intl', country: 'PH' },
  { code: 'CGK', city: 'Jakarta', name: 'Soekarno-Hatta Intl', country: 'ID' },
  { code: 'AKL', city: 'Auckland', name: 'Auckland', country: 'NZ' },
];

export function searchAirports(query: string, limit = 8): Airport[] {
  if (!query || query.length < 1) return [];

  const q = query.toLowerCase().trim();
  const results: { airport: Airport; score: number }[] = [];

  for (const airport of AIRPORTS) {
    const code = airport.code.toLowerCase();
    const city = airport.city.toLowerCase();
    const name = airport.name.toLowerCase();

    // Exact code match — highest priority
    if (code === q) {
      results.push({ airport, score: 100 });
    } else if (code.startsWith(q)) {
      results.push({ airport, score: 80 });
    } else if (city.startsWith(q)) {
      results.push({ airport, score: 60 });
    } else if (city.includes(q)) {
      results.push({ airport, score: 40 });
    } else if (name.includes(q)) {
      results.push({ airport, score: 20 });
    }
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(r => r.airport);
}

export function getAirport(code: string): Airport | undefined {
  return AIRPORTS.find(a => a.code === code.toUpperCase());
}
