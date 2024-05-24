
export const getProximity = (country1, country2) => {
  // get centroid of country1
  const c1 = centroids.find(c => c.name === country1)
  const c2 = centroids.find(c => c.name === country2)

  if (!c1 || !c2) {
    console.log('Could not find country', country1, country2)
    return { distance: 0, isNeighbor: false, couldNotResolve: true }
  }

  const distanceKm = getDistanceFromLatLonInKm(c1.latitude, c1.longitude, c2.latitude, c2.longitude)
  const distanceMiles = distanceKm * 0.621371

  const isNeighbor = neighbors[c1.alpha2].neighbours.includes(c2.alpha2)

  return { distance: distanceMiles, isNeighbor }
}

const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  var R = 6371 // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1) // deg2rad below
  var dLon = deg2rad(lon2-lon1)
  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c // Distance in km
  return d
}

const deg2rad = deg => deg * (Math.PI/180)

const centroids = [
  {
    "alpha2": "AD",
    "alpha3": "AND",
    "latitude": 42.546245,
    "longitude": 1.601554,
    "name": "Andorra"
  },
  {
    "alpha2": "AE",
    "alpha3": "ARE",
    "latitude": 23.424076,
    "longitude": 53.847818,
    "name": "United Arab Emirates"
  },
  {
    "alpha2": "AF",
    "alpha3": "AFG",
    "latitude": 33.93911,
    "longitude": 67.709953,
    "name": "Afghanistan"
  },
  {
    "alpha2": "AG",
    "alpha3": "ATG",
    "latitude": 17.060816,
    "longitude": -61.796428,
    "name": "Antigua and Barbuda"
  },
  {
    "alpha2": "AI",
    "alpha3": "AIA",
    "latitude": 18.220554,
    "longitude": -63.068615,
    "name": "Anguilla"
  },
  {
    "alpha2": "AL",
    "alpha3": "ALB",
    "latitude": 41.153332,
    "longitude": 20.168331,
    "name": "Albania"
  },
  {
    "alpha2": "AM",
    "alpha3": "ARM",
    "latitude": 40.069099,
    "longitude": 45.038189,
    "name": "Armenia"
  },
  {
    "alpha2": "AN",
    "alpha3": "ANT",
    "latitude": 12.226079,
    "longitude": -69.060087,
    "name": "Netherlands Antilles"
  },
  {
    "alpha2": "AO",
    "alpha3": "AGO",
    "latitude": -11.202692,
    "longitude": 17.873887,
    "name": "Angola"
  },
  {
    "alpha2": "AQ",
    "alpha3": "ATA",
    "latitude": -75.250973,
    "longitude": -0.071389,
    "name": "Antarctica"
  },
  {
    "alpha2": "AR",
    "alpha3": "ARG",
    "latitude": -38.416097,
    "longitude": -63.616672,
    "name": "Argentina"
  },
  {
    "alpha2": "AS",
    "alpha3": "ASM",
    "latitude": -14.270972,
    "longitude": -170.132217,
    "name": "American Samoa"
  },
  {
    "alpha2": "AT",
    "alpha3": "AUT",
    "latitude": 47.516231,
    "longitude": 14.550072,
    "name": "Austria"
  },
  {
    "alpha2": "AU",
    "alpha3": "AUS",
    "latitude": -25.274398,
    "longitude": 133.775136,
    "name": "Australia"
  },
  {
    "alpha2": "AW",
    "alpha3": "ABW",
    "latitude": 12.52111,
    "longitude": -69.968338,
    "name": "Aruba"
  },
  {
    "alpha2": "AZ",
    "alpha3": "AZE",
    "latitude": 40.143105,
    "longitude": 47.576927,
    "name": "Azerbaijan"
  },
  {
    "alpha2": "BA",
    "alpha3": "BIH",
    "latitude": 43.915886,
    "longitude": 17.679076,
    "name": "Bosnia and Herzegovina"
  },
  {
    "alpha2": "BB",
    "alpha3": "BRB",
    "latitude": 13.193887,
    "longitude": -59.543198,
    "name": "Barbados"
  },
  {
    "alpha2": "BD",
    "alpha3": "BGD",
    "latitude": 23.684994,
    "longitude": 90.356331,
    "name": "Bangladesh"
  },
  {
    "alpha2": "BE",
    "alpha3": "BEL",
    "latitude": 50.503887,
    "longitude": 4.469936,
    "name": "Belgium"
  },
  {
    "alpha2": "BF",
    "alpha3": "BFA",
    "latitude": 12.238333,
    "longitude": -1.561593,
    "name": "Burkina Faso"
  },
  {
    "alpha2": "BG",
    "alpha3": "BGR",
    "latitude": 42.733883,
    "longitude": 25.48583,
    "name": "Bulgaria"
  },
  {
    "alpha2": "BH",
    "alpha3": "BHR",
    "latitude": 25.930414,
    "longitude": 50.637772,
    "name": "Bahrain"
  },
  {
    "alpha2": "BI",
    "alpha3": "BDI",
    "latitude": -3.373056,
    "longitude": 29.918886,
    "name": "Burundi"
  },
  {
    "alpha2": "BJ",
    "alpha3": "BEN",
    "latitude": 9.30769,
    "longitude": 2.315834,
    "name": "Benin"
  },
  {
    "alpha2": "BM",
    "alpha3": "BMU",
    "latitude": 32.321384,
    "longitude": -64.75737,
    "name": "Bermuda"
  },
  {
    "alpha2": "BN",
    "alpha3": "BRN",
    "latitude": 4.535277,
    "longitude": 114.727669,
    "name": "Brunei"
  },
  {
    "alpha2": "BO",
    "alpha3": "BOL",
    "latitude": -16.290154,
    "longitude": -63.588653,
    "name": "Bolivia"
  },
  {
    "alpha2": "BR",
    "alpha3": "BRA",
    "latitude": -14.235004,
    "longitude": -51.92528,
    "name": "Brazil"
  },
  {
    "alpha2": "BS",
    "alpha3": "BHS",
    "latitude": 25.03428,
    "longitude": -77.39628,
    "name": "Bahamas"
  },
  {
    "alpha2": "BT",
    "alpha3": "BTN",
    "latitude": 27.514162,
    "longitude": 90.433601,
    "name": "Bhutan"
  },
  {
    "alpha2": "BV",
    "alpha3": "BVT",
    "latitude": -54.423199,
    "longitude": 3.413194,
    "name": "Bouvet Island"
  },
  {
    "alpha2": "BW",
    "alpha3": "BWA",
    "latitude": -22.328474,
    "longitude": 24.684866,
    "name": "Botswana"
  },
  {
    "alpha2": "BY",
    "alpha3": "BLR",
    "latitude": 53.709807,
    "longitude": 27.953389,
    "name": "Belarus"
  },
  {
    "alpha2": "BZ",
    "alpha3": "BLZ",
    "latitude": 17.189877,
    "longitude": -88.49765,
    "name": "Belize"
  },
  {
    "alpha2": "CA",
    "alpha3": "CAN",
    "latitude": 56.130366,
    "longitude": -106.346771,
    "name": "Canada"
  },
  {
    "alpha2": "CC",
    "alpha3": "CCK",
    "latitude": -12.164165,
    "longitude": 96.870956,
    "name": "Cocos [Keeling] Islands"
  },
  {
    "alpha2": "CD",
    "alpha3": "COD",
    "latitude": -4.038333,
    "longitude": 21.758664,
    "name": "Congo [DRC]"
  },
  {
    "alpha2": "CF",
    "alpha3": "CAF",
    "latitude": 6.611111,
    "longitude": 20.939444,
    "name": "Central African Republic"
  },
  {
    "alpha2": "CG",
    "alpha3": "COG",
    "latitude": -0.228021,
    "longitude": 15.827659,
    "name": "Congo [Republic]"
  },
  {
    "alpha2": "CH",
    "alpha3": "CHE",
    "latitude": 46.818188,
    "longitude": 8.227512,
    "name": "Switzerland"
  },
  {
    "alpha2": "CI",
    "alpha3": "CIV",
    "latitude": 7.539989,
    "longitude": -5.54708,
    "name": "Côte d'Ivoire"
  },
  {
    "alpha2": "CK",
    "alpha3": "COK",
    "latitude": -21.236736,
    "longitude": -159.777671,
    "name": "Cook Islands"
  },
  {
    "alpha2": "CL",
    "alpha3": "CHL",
    "latitude": -35.675147,
    "longitude": -71.542969,
    "name": "Chile"
  },
  {
    "alpha2": "CM",
    "alpha3": "CMR",
    "latitude": 7.369722,
    "longitude": 12.354722,
    "name": "Cameroon"
  },
  {
    "alpha2": "CN",
    "alpha3": "CHN",
    "latitude": 35.86166,
    "longitude": 104.195397,
    "name": "China"
  },
  {
    "alpha2": "CO",
    "alpha3": "COL",
    "latitude": 4.570868,
    "longitude": -74.297333,
    "name": "Colombia"
  },
  {
    "alpha2": "CR",
    "alpha3": "CRI",
    "latitude": 9.748917,
    "longitude": -83.753428,
    "name": "Costa Rica"
  },
  {
    "alpha2": "CU",
    "alpha3": "CUB",
    "latitude": 21.521757,
    "longitude": -77.781167,
    "name": "Cuba"
  },
  {
    "alpha2": "CV",
    "alpha3": "CPV",
    "latitude": 16.002082,
    "longitude": -24.013197,
    "name": "Cape Verde"
  },
  {
    "alpha2": "CX",
    "alpha3": "CXR",
    "latitude": -10.447525,
    "longitude": 105.690449,
    "name": "Christmas Island"
  },
  {
    "alpha2": "CY",
    "alpha3": "CYP",
    "latitude": 35.126413,
    "longitude": 33.429859,
    "name": "Cyprus"
  },
  {
    "alpha2": "CZ",
    "alpha3": "CZE",
    "latitude": 49.817492,
    "longitude": 15.472962,
    "name": "Czech Republic"
  },
  {
    "alpha2": "DE",
    "alpha3": "DEU",
    "latitude": 51.165691,
    "longitude": 10.451526,
    "name": "Germany"
  },
  {
    "alpha2": "DJ",
    "alpha3": "DJI",
    "latitude": 11.825138,
    "longitude": 42.590275,
    "name": "Djibouti"
  },
  {
    "alpha2": "DK",
    "alpha3": "DNK",
    "latitude": 56.26392,
    "longitude": 9.501785,
    "name": "Denmark"
  },
  {
    "alpha2": "DM",
    "alpha3": "DMA",
    "latitude": 15.414999,
    "longitude": -61.370976,
    "name": "Dominica"
  },
  {
    "alpha2": "DO",
    "alpha3": "DOM",
    "latitude": 18.735693,
    "longitude": -70.162651,
    "name": "Dominican Republic"
  },
  {
    "alpha2": "DZ",
    "alpha3": "DZA",
    "latitude": 28.033886,
    "longitude": 1.659626,
    "name": "Algeria"
  },
  {
    "alpha2": "EC",
    "alpha3": "ECU",
    "latitude": -1.831239,
    "longitude": -78.183406,
    "name": "Ecuador"
  },
  {
    "alpha2": "EE",
    "alpha3": "EST",
    "latitude": 58.595272,
    "longitude": 25.013607,
    "name": "Estonia"
  },
  {
    "alpha2": "EG",
    "alpha3": "EGY",
    "latitude": 26.820553,
    "longitude": 30.802498,
    "name": "Egypt"
  },
  {
    "alpha2": "EH",
    "alpha3": "ESH",
    "latitude": 24.215527,
    "longitude": -12.885834,
    "name": "Western Sahara"
  },
  {
    "alpha2": "ER",
    "alpha3": "ERI",
    "latitude": 15.179384,
    "longitude": 39.782334,
    "name": "Eritrea"
  },
  {
    "alpha2": "ES",
    "alpha3": "ESP",
    "latitude": 40.463667,
    "longitude": -3.74922,
    "name": "Spain"
  },
  {
    "alpha2": "ET",
    "alpha3": "ETH",
    "latitude": 9.145,
    "longitude": 40.489673,
    "name": "Ethiopia"
  },
  {
    "alpha2": "FI",
    "alpha3": "FIN",
    "latitude": 61.92411,
    "longitude": 25.748151,
    "name": "Finland"
  },
  {
    "alpha2": "FJ",
    "alpha3": "FJI",
    "latitude": -16.578193,
    "longitude": 179.414413,
    "name": "Fiji"
  },
  {
    "alpha2": "FK",
    "alpha3": "FLK",
    "latitude": -51.796253,
    "longitude": -59.523613,
    "name": "Falkland Islands [Islas Malvinas]"
  },
  {
    "alpha2": "FM",
    "alpha3": "FSM",
    "latitude": 7.425554,
    "longitude": 150.550812,
    "name": "Micronesia"
  },
  {
    "alpha2": "FO",
    "alpha3": "FRO",
    "latitude": 61.892635,
    "longitude": -6.911806,
    "name": "Faroe Islands"
  },
  {
    "alpha2": "FR",
    "alpha3": "FRA",
    "latitude": 46.227638,
    "longitude": 2.213749,
    "name": "France"
  },
  {
    "alpha2": "GA",
    "alpha3": "GAB",
    "latitude": -0.803689,
    "longitude": 11.609444,
    "name": "Gabon"
  },
  {
    "alpha2": "GB",
    "alpha3": "GBR",
    "latitude": 55.378051,
    "longitude": -3.435973,
    "name": "United Kingdom"
  },
  {
    "alpha2": "GD",
    "alpha3": "GRD",
    "latitude": 12.262776,
    "longitude": -61.604171,
    "name": "Grenada"
  },
  {
    "alpha2": "GE",
    "alpha3": "GEO",
    "latitude": 42.315407,
    "longitude": 43.356892,
    "name": "Georgia"
  },
  {
    "alpha2": "GF",
    "alpha3": "GUF",
    "latitude": 3.933889,
    "longitude": -53.125782,
    "name": "French Guiana"
  },
  {
    "alpha2": "GG",
    "alpha3": "GGY",
    "latitude": 49.465691,
    "longitude": -2.585278,
    "name": "Guernsey"
  },
  {
    "alpha2": "GH",
    "alpha3": "GHA",
    "latitude": 7.946527,
    "longitude": -1.023194,
    "name": "Ghana"
  },
  {
    "alpha2": "GI",
    "alpha3": "GIB",
    "latitude": 36.137741,
    "longitude": -5.345374,
    "name": "Gibraltar"
  },
  {
    "alpha2": "GL",
    "alpha3": "GRL",
    "latitude": 71.706936,
    "longitude": -42.604303,
    "name": "Greenland"
  },
  {
    "alpha2": "GM",
    "alpha3": "GMB",
    "latitude": 13.443182,
    "longitude": -15.310139,
    "name": "Gambia"
  },
  {
    "alpha2": "GN",
    "alpha3": "GIN",
    "latitude": 9.945587,
    "longitude": -9.696645,
    "name": "Guinea"
  },
  {
    "alpha2": "GP",
    "alpha3": "GLP",
    "latitude": 16.995971,
    "longitude": -62.067641,
    "name": "Guadeloupe"
  },
  {
    "alpha2": "GQ",
    "alpha3": "GNQ",
    "latitude": 1.650801,
    "longitude": 10.267895,
    "name": "Equatorial Guinea"
  },
  {
    "alpha2": "GR",
    "alpha3": "GRC",
    "latitude": 39.074208,
    "longitude": 21.824312,
    "name": "Greece"
  },
  {
    "alpha2": "GS",
    "alpha3": "SGS",
    "latitude": -54.429579,
    "longitude": -36.587909,
    "name": "South Georgia and the South Sandwich Islands"
  },
  {
    "alpha2": "GT",
    "alpha3": "GTM",
    "latitude": 15.783471,
    "longitude": -90.230759,
    "name": "Guatemala"
  },
  {
    "alpha2": "GU",
    "alpha3": "GUM",
    "latitude": 13.444304,
    "longitude": 144.793731,
    "name": "Guam"
  },
  {
    "alpha2": "GW",
    "alpha3": "GNB",
    "latitude": 11.803749,
    "longitude": -15.180413,
    "name": "Guinea-Bissau"
  },
  {
    "alpha2": "GY",
    "alpha3": "GUY",
    "latitude": 4.860416,
    "longitude": -58.93018,
    "name": "Guyana"
  },
  {
    "alpha2": "GZ",
    "alpha3": "",
    "latitude": 31.354676,
    "longitude": 34.308825,
    "name": "Gaza Strip"
  },
  {
    "alpha2": "HK",
    "alpha3": "HKG",
    "latitude": 22.396428,
    "longitude": 114.109497,
    "name": "Hong Kong"
  },
  {
    "alpha2": "HM",
    "alpha3": "HMD",
    "latitude": -53.08181,
    "longitude": 73.504158,
    "name": "Heard Island and McDonald Islands"
  },
  {
    "alpha2": "HN",
    "alpha3": "HND",
    "latitude": 15.199999,
    "longitude": -86.241905,
    "name": "Honduras"
  },
  {
    "alpha2": "HR",
    "alpha3": "HRV",
    "latitude": 45.1,
    "longitude": 15.2,
    "name": "Croatia"
  },
  {
    "alpha2": "HT",
    "alpha3": "HTI",
    "latitude": 18.971187,
    "longitude": -72.285215,
    "name": "Haiti"
  },
  {
    "alpha2": "HU",
    "alpha3": "HUN",
    "latitude": 47.162494,
    "longitude": 19.503304,
    "name": "Hungary"
  },
  {
    "alpha2": "ID",
    "alpha3": "IDN",
    "latitude": -0.789275,
    "longitude": 113.921327,
    "name": "Indonesia"
  },
  {
    "alpha2": "IE",
    "alpha3": "IRL",
    "latitude": 53.41291,
    "longitude": -8.24389,
    "name": "Ireland"
  },
  {
    "alpha2": "IL",
    "alpha3": "ISR",
    "latitude": 31.046051,
    "longitude": 34.851612,
    "name": "Israel"
  },
  {
    "alpha2": "IM",
    "alpha3": "IMN",
    "latitude": 54.236107,
    "longitude": -4.548056,
    "name": "Isle of Man"
  },
  {
    "alpha2": "IN",
    "alpha3": "IND",
    "latitude": 20.593684,
    "longitude": 78.96288,
    "name": "India"
  },
  {
    "alpha2": "IO",
    "alpha3": "IOT",
    "latitude": -6.343194,
    "longitude": 71.876519,
    "name": "British Indian Ocean Territory"
  },
  {
    "alpha2": "IQ",
    "alpha3": "IRQ",
    "latitude": 33.223191,
    "longitude": 43.679291,
    "name": "Iraq"
  },
  {
    "alpha2": "IR",
    "alpha3": "IRN",
    "latitude": 32.427908,
    "longitude": 53.688046,
    "name": "Iran"
  },
  {
    "alpha2": "IS",
    "alpha3": "ISL",
    "latitude": 64.963051,
    "longitude": -19.020835,
    "name": "Iceland"
  },
  {
    "alpha2": "IT",
    "alpha3": "ITA",
    "latitude": 41.87194,
    "longitude": 12.56738,
    "name": "Italy"
  },
  {
    "alpha2": "JE",
    "alpha3": "JEY",
    "latitude": 49.214439,
    "longitude": -2.13125,
    "name": "Jersey"
  },
  {
    "alpha2": "JM",
    "alpha3": "JAM",
    "latitude": 18.109581,
    "longitude": -77.297508,
    "name": "Jamaica"
  },
  {
    "alpha2": "JO",
    "alpha3": "JOR",
    "latitude": 30.585164,
    "longitude": 36.238414,
    "name": "Jordan"
  },
  {
    "alpha2": "JP",
    "alpha3": "JPN",
    "latitude": 36.204824,
    "longitude": 138.252924,
    "name": "Japan"
  },
  {
    "alpha2": "KE",
    "alpha3": "KEN",
    "latitude": -0.023559,
    "longitude": 37.906193,
    "name": "Kenya"
  },
  {
    "alpha2": "KG",
    "alpha3": "KGZ",
    "latitude": 41.20438,
    "longitude": 74.766098,
    "name": "Kyrgyzstan"
  },
  {
    "alpha2": "KH",
    "alpha3": "KHM",
    "latitude": 12.565679,
    "longitude": 104.990963,
    "name": "Cambodia"
  },
  {
    "alpha2": "KI",
    "alpha3": "KIR",
    "latitude": -3.370417,
    "longitude": -168.734039,
    "name": "Kiribati"
  },
  {
    "alpha2": "KM",
    "alpha3": "COM",
    "latitude": -11.875001,
    "longitude": 43.872219,
    "name": "Comoros"
  },
  {
    "alpha2": "KN",
    "alpha3": "KNA",
    "latitude": 17.357822,
    "longitude": -62.782998,
    "name": "Saint Kitts and Nevis"
  },
  {
    "alpha2": "KP",
    "alpha3": "PRK",
    "latitude": 40.339852,
    "longitude": 127.510093,
    "name": "North Korea"
  },
  {
    "alpha2": "KR",
    "alpha3": "KOR",
    "latitude": 35.907757,
    "longitude": 127.766922,
    "name": "South Korea"
  },
  {
    "alpha2": "KW",
    "alpha3": "KWT",
    "latitude": 29.31166,
    "longitude": 47.481766,
    "name": "Kuwait"
  },
  {
    "alpha2": "KY",
    "alpha3": "CYM",
    "latitude": 19.513469,
    "longitude": -80.566956,
    "name": "Cayman Islands"
  },
  {
    "alpha2": "KZ",
    "alpha3": "KAZ",
    "latitude": 48.019573,
    "longitude": 66.923684,
    "name": "Kazakhstan"
  },
  {
    "alpha2": "LA",
    "alpha3": "LAO",
    "latitude": 19.85627,
    "longitude": 102.495496,
    "name": "Laos"
  },
  {
    "alpha2": "LB",
    "alpha3": "LBN",
    "latitude": 33.854721,
    "longitude": 35.862285,
    "name": "Lebanon"
  },
  {
    "alpha2": "LC",
    "alpha3": "LCA",
    "latitude": 13.909444,
    "longitude": -60.978893,
    "name": "Saint Lucia"
  },
  {
    "alpha2": "LI",
    "alpha3": "LIE",
    "latitude": 47.166,
    "longitude": 9.555373,
    "name": "Liechtenstein"
  },
  {
    "alpha2": "LK",
    "alpha3": "LKA",
    "latitude": 7.873054,
    "longitude": 80.771797,
    "name": "Sri Lanka"
  },
  {
    "alpha2": "LR",
    "alpha3": "LBR",
    "latitude": 6.428055,
    "longitude": -9.429499,
    "name": "Liberia"
  },
  {
    "alpha2": "LS",
    "alpha3": "LSO",
    "latitude": -29.609988,
    "longitude": 28.233608,
    "name": "Lesotho"
  },
  {
    "alpha2": "LT",
    "alpha3": "LTU",
    "latitude": 55.169438,
    "longitude": 23.881275,
    "name": "Lithuania"
  },
  {
    "alpha2": "LU",
    "alpha3": "LUX",
    "latitude": 49.815273,
    "longitude": 6.129583,
    "name": "Luxembourg"
  },
  {
    "alpha2": "LV",
    "alpha3": "LVA",
    "latitude": 56.879635,
    "longitude": 24.603189,
    "name": "Latvia"
  },
  {
    "alpha2": "LY",
    "alpha3": "LBY",
    "latitude": 26.3351,
    "longitude": 17.228331,
    "name": "Libya"
  },
  {
    "alpha2": "MA",
    "alpha3": "MAR",
    "latitude": 31.791702,
    "longitude": -7.09262,
    "name": "Morocco"
  },
  {
    "alpha2": "MC",
    "alpha3": "MCO",
    "latitude": 43.750298,
    "longitude": 7.412841,
    "name": "Monaco"
  },
  {
    "alpha2": "MD",
    "alpha3": "MDA",
    "latitude": 47.411631,
    "longitude": 28.369885,
    "name": "Moldova"
  },
  {
    "alpha2": "ME",
    "alpha3": "MNE",
    "latitude": 42.708678,
    "longitude": 19.37439,
    "name": "Montenegro"
  },
  {
    "alpha2": "MG",
    "alpha3": "MDG",
    "latitude": -18.766947,
    "longitude": 46.869107,
    "name": "Madagascar"
  },
  {
    "alpha2": "MH",
    "alpha3": "MHL",
    "latitude": 7.131474,
    "longitude": 171.184478,
    "name": "Marshall Islands"
  },
  {
    "alpha2": "MK",
    "alpha3": "MKD",
    "latitude": 41.608635,
    "longitude": 21.745275,
    "name": "Macedonia [FYROM]"
  },
  {
    "alpha2": "ML",
    "alpha3": "MLI",
    "latitude": 17.570692,
    "longitude": -3.996166,
    "name": "Mali"
  },
  {
    "alpha2": "MM",
    "alpha3": "MMR",
    "latitude": 21.913965,
    "longitude": 95.956223,
    "name": "Myanmar [Burma]"
  },
  {
    "alpha2": "MN",
    "alpha3": "MNG",
    "latitude": 46.862496,
    "longitude": 103.846656,
    "name": "Mongolia"
  },
  {
    "alpha2": "MO",
    "alpha3": "MAC",
    "latitude": 22.198745,
    "longitude": 113.543873,
    "name": "Macau"
  },
  {
    "alpha2": "MP",
    "alpha3": "MNP",
    "latitude": 17.33083,
    "longitude": 145.38469,
    "name": "Northern Mariana Islands"
  },
  {
    "alpha2": "MQ",
    "alpha3": "MTQ",
    "latitude": 14.641528,
    "longitude": -61.024174,
    "name": "Martinique"
  },
  {
    "alpha2": "MR",
    "alpha3": "MRT",
    "latitude": 21.00789,
    "longitude": -10.940835,
    "name": "Mauritania"
  },
  {
    "alpha2": "MS",
    "alpha3": "MSR",
    "latitude": 16.742498,
    "longitude": -62.187366,
    "name": "Montserrat"
  },
  {
    "alpha2": "MT",
    "alpha3": "MLT",
    "latitude": 35.937496,
    "longitude": 14.375416,
    "name": "Malta"
  },
  {
    "alpha2": "MU",
    "alpha3": "MUS",
    "latitude": -20.348404,
    "longitude": 57.552152,
    "name": "Mauritius"
  },
  {
    "alpha2": "MV",
    "alpha3": "MDV",
    "latitude": 3.202778,
    "longitude": 73.22068,
    "name": "Maldives"
  },
  {
    "alpha2": "MW",
    "alpha3": "MWI",
    "latitude": -13.254308,
    "longitude": 34.301525,
    "name": "Malawi"
  },
  {
    "alpha2": "MX",
    "alpha3": "MEX",
    "latitude": 23.634501,
    "longitude": -102.552784,
    "name": "Mexico"
  },
  {
    "alpha2": "MY",
    "alpha3": "MYS",
    "latitude": 4.210484,
    "longitude": 101.975766,
    "name": "Malaysia"
  },
  {
    "alpha2": "MZ",
    "alpha3": "MOZ",
    "latitude": -18.665695,
    "longitude": 35.529562,
    "name": "Mozambique"
  },
  {
    "alpha2": "NA",
    "alpha3": "NAM",
    "latitude": -22.95764,
    "longitude": 18.49041,
    "name": "Namibia"
  },
  {
    "alpha2": "NC",
    "alpha3": "NCL",
    "latitude": -20.904305,
    "longitude": 165.618042,
    "name": "New Caledonia"
  },
  {
    "alpha2": "NE",
    "alpha3": "NER",
    "latitude": 17.607789,
    "longitude": 8.081666,
    "name": "Niger"
  },
  {
    "alpha2": "NF",
    "alpha3": "NFK",
    "latitude": -29.040835,
    "longitude": 167.954712,
    "name": "Norfolk Island"
  },
  {
    "alpha2": "NG",
    "alpha3": "NGA",
    "latitude": 9.081999,
    "longitude": 8.675277,
    "name": "Nigeria"
  },
  {
    "alpha2": "NI",
    "alpha3": "NIC",
    "latitude": 12.865416,
    "longitude": -85.207229,
    "name": "Nicaragua"
  },
  {
    "alpha2": "NL",
    "alpha3": "NLD",
    "latitude": 52.132633,
    "longitude": 5.291266,
    "name": "Netherlands"
  },
  {
    "alpha2": "NO",
    "alpha3": "NOR",
    "latitude": 60.472024,
    "longitude": 8.468946,
    "name": "Norway"
  },
  {
    "alpha2": "NP",
    "alpha3": "NPL",
    "latitude": 28.394857,
    "longitude": 84.124008,
    "name": "Nepal"
  },
  {
    "alpha2": "NR",
    "alpha3": "NRU",
    "latitude": -0.522778,
    "longitude": 166.931503,
    "name": "Nauru"
  },
  {
    "alpha2": "NU",
    "alpha3": "NIU",
    "latitude": -19.054445,
    "longitude": -169.867233,
    "name": "Niue"
  },
  {
    "alpha2": "NZ",
    "alpha3": "NZL",
    "latitude": -40.900557,
    "longitude": 174.885971,
    "name": "New Zealand"
  },
  {
    "alpha2": "OM",
    "alpha3": "OMN",
    "latitude": 21.512583,
    "longitude": 55.923255,
    "name": "Oman"
  },
  {
    "alpha2": "PA",
    "alpha3": "PAN",
    "latitude": 8.537981,
    "longitude": -80.782127,
    "name": "Panama"
  },
  {
    "alpha2": "PE",
    "alpha3": "PER",
    "latitude": -9.189967,
    "longitude": -75.015152,
    "name": "Peru"
  },
  {
    "alpha2": "PF",
    "alpha3": "PYF",
    "latitude": -17.679742,
    "longitude": -149.406843,
    "name": "French Polynesia"
  },
  {
    "alpha2": "PG",
    "alpha3": "PNG",
    "latitude": -6.314993,
    "longitude": 143.95555,
    "name": "Papua New Guinea"
  },
  {
    "alpha2": "PH",
    "alpha3": "PHL",
    "latitude": 12.879721,
    "longitude": 121.774017,
    "name": "Philippines"
  },
  {
    "alpha2": "PK",
    "alpha3": "PAK",
    "latitude": 30.375321,
    "longitude": 69.345116,
    "name": "Pakistan"
  },
  {
    "alpha2": "PL",
    "alpha3": "POL",
    "latitude": 51.919438,
    "longitude": 19.145136,
    "name": "Poland"
  },
  {
    "alpha2": "PM",
    "alpha3": "SPM",
    "latitude": 46.941936,
    "longitude": -56.27111,
    "name": "Saint Pierre and Miquelon"
  },
  {
    "alpha2": "PN",
    "alpha3": "PCN",
    "latitude": -24.703615,
    "longitude": -127.439308,
    "name": "Pitcairn Islands"
  },
  {
    "alpha2": "PR",
    "alpha3": "PRI",
    "latitude": 18.220833,
    "longitude": -66.590149,
    "name": "Puerto Rico"
  },
  {
    "alpha2": "PS",
    "alpha3": "PSE",
    "latitude": 31.952162,
    "longitude": 35.233154,
    "name": "Palestinian Territories"
  },
  {
    "alpha2": "PT",
    "alpha3": "PRT",
    "latitude": 39.399872,
    "longitude": -8.224454,
    "name": "Portugal"
  },
  {
    "alpha2": "PW",
    "alpha3": "PLW",
    "latitude": 7.51498,
    "longitude": 134.58252,
    "name": "Palau"
  },
  {
    "alpha2": "PY",
    "alpha3": "PRY",
    "latitude": -23.442503,
    "longitude": -58.443832,
    "name": "Paraguay"
  },
  {
    "alpha2": "QA",
    "alpha3": "QAT",
    "latitude": 25.354826,
    "longitude": 51.183884,
    "name": "Qatar"
  },
  {
    "alpha2": "RE",
    "alpha3": "REU",
    "latitude": -21.115141,
    "longitude": 55.536384,
    "name": "Réunion"
  },
  {
    "alpha2": "RO",
    "alpha3": "ROU",
    "latitude": 45.943161,
    "longitude": 24.96676,
    "name": "Romania"
  },
  {
    "alpha2": "RS",
    "alpha3": "SRB",
    "latitude": 44.016521,
    "longitude": 21.005859,
    "name": "Serbia"
  },
  {
    "alpha2": "RU",
    "alpha3": "RUS",
    "latitude": 61.52401,
    "longitude": 105.318756,
    "name": "Russia"
  },
  {
    "alpha2": "RW",
    "alpha3": "RWA",
    "latitude": -1.940278,
    "longitude": 29.873888,
    "name": "Rwanda"
  },
  {
    "alpha2": "SA",
    "alpha3": "SAU",
    "latitude": 23.885942,
    "longitude": 45.079162,
    "name": "Saudi Arabia"
  },
  {
    "alpha2": "SB",
    "alpha3": "SLB",
    "latitude": -9.64571,
    "longitude": 160.156194,
    "name": "Solomon Islands"
  },
  {
    "alpha2": "SC",
    "alpha3": "SYC",
    "latitude": -4.679574,
    "longitude": 55.491977,
    "name": "Seychelles"
  },
  {
    "alpha2": "SD",
    "alpha3": "SDN",
    "latitude": 12.862807,
    "longitude": 30.217636,
    "name": "Sudan"
  },
  {
    "alpha2": "SE",
    "alpha3": "SWE",
    "latitude": 60.128161,
    "longitude": 18.643501,
    "name": "Sweden"
  },
  {
    "alpha2": "SG",
    "alpha3": "SGP",
    "latitude": 1.352083,
    "longitude": 103.819836,
    "name": "Singapore"
  },
  {
    "alpha2": "SH",
    "alpha3": "SHN",
    "latitude": -24.143474,
    "longitude": -10.030696,
    "name": "Saint Helena"
  },
  {
    "alpha2": "SI",
    "alpha3": "SVN",
    "latitude": 46.151241,
    "longitude": 14.995463,
    "name": "Slovenia"
  },
  {
    "alpha2": "SJ",
    "alpha3": "SJM",
    "latitude": 77.553604,
    "longitude": 23.670272,
    "name": "Svalbard and Jan Mayen"
  },
  {
    "alpha2": "SK",
    "alpha3": "SVK",
    "latitude": 48.669026,
    "longitude": 19.699024,
    "name": "Slovakia"
  },
  {
    "alpha2": "SL",
    "alpha3": "SLE",
    "latitude": 8.460555,
    "longitude": -11.779889,
    "name": "Sierra Leone"
  },
  {
    "alpha2": "SM",
    "alpha3": "SMR",
    "latitude": 43.94236,
    "longitude": 12.457777,
    "name": "San Marino"
  },
  {
    "alpha2": "SN",
    "alpha3": "SEN",
    "latitude": 14.497401,
    "longitude": -14.452362,
    "name": "Senegal"
  },
  {
    "alpha2": "SO",
    "alpha3": "SOM",
    "latitude": 5.152149,
    "longitude": 46.199616,
    "name": "Somalia"
  },
  {
    "alpha2": "SR",
    "alpha3": "SUR",
    "latitude": 3.919305,
    "longitude": -56.027783,
    "name": "Suriname"
  },
  {
    "alpha2": "ST",
    "alpha3": "STP",
    "latitude": 0.18636,
    "longitude": 6.613081,
    "name": "São Tomé and Príncipe"
  },
  {
    "alpha2": "SV",
    "alpha3": "SLV",
    "latitude": 13.794185,
    "longitude": -88.89653,
    "name": "El Salvador"
  },
  {
    "alpha2": "SY",
    "alpha3": "SYR",
    "latitude": 34.802075,
    "longitude": 38.996815,
    "name": "Syria"
  },
  {
    "alpha2": "SZ",
    "alpha3": "SWZ",
    "latitude": -26.522503,
    "longitude": 31.465866,
    "name": "Swaziland"
  },
  {
    "alpha2": "TC",
    "alpha3": "TCA",
    "latitude": 21.694025,
    "longitude": -71.797928,
    "name": "Turks and Caicos Islands"
  },
  {
    "alpha2": "TD",
    "alpha3": "TCD",
    "latitude": 15.454166,
    "longitude": 18.732207,
    "name": "Chad"
  },
  {
    "alpha2": "TF",
    "alpha3": "ATF",
    "latitude": -49.280366,
    "longitude": 69.348557,
    "name": "French Southern Territories"
  },
  {
    "alpha2": "TG",
    "alpha3": "TGO",
    "latitude": 8.619543,
    "longitude": 0.824782,
    "name": "Togo"
  },
  {
    "alpha2": "TH",
    "alpha3": "THA",
    "latitude": 15.870032,
    "longitude": 100.992541,
    "name": "Thailand"
  },
  {
    "alpha2": "TJ",
    "alpha3": "TJK",
    "latitude": 38.861034,
    "longitude": 71.276093,
    "name": "Tajikistan"
  },
  {
    "alpha2": "TK",
    "alpha3": "TKL",
    "latitude": -8.967363,
    "longitude": -171.855881,
    "name": "Tokelau"
  },
  {
    "alpha2": "TL",
    "alpha3": "TLS",
    "latitude": -8.874217,
    "longitude": 125.727539,
    "name": "Timor-Leste"
  },
  {
    "alpha2": "TM",
    "alpha3": "TKM",
    "latitude": 38.969719,
    "longitude": 59.556278,
    "name": "Turkmenistan"
  },
  {
    "alpha2": "TN",
    "alpha3": "TUN",
    "latitude": 33.886917,
    "longitude": 9.537499,
    "name": "Tunisia"
  },
  {
    "alpha2": "TO",
    "alpha3": "TON",
    "latitude": -21.178986,
    "longitude": -175.198242,
    "name": "Tonga"
  },
  {
    "alpha2": "TR",
    "alpha3": "TUR",
    "latitude": 38.963745,
    "longitude": 35.243322,
    "name": "Turkey"
  },
  {
    "alpha2": "TT",
    "alpha3": "TTO",
    "latitude": 10.691803,
    "longitude": -61.222503,
    "name": "Trinidad and Tobago"
  },
  {
    "alpha2": "TV",
    "alpha3": "TUV",
    "latitude": -7.109535,
    "longitude": 177.64933,
    "name": "Tuvalu"
  },
  {
    "alpha2": "TW",
    "alpha3": "TWN",
    "latitude": 23.69781,
    "longitude": 120.960515,
    "name": "Taiwan"
  },
  {
    "alpha2": "TZ",
    "alpha3": "TZA",
    "latitude": -6.369028,
    "longitude": 34.888822,
    "name": "Tanzania"
  },
  {
    "alpha2": "UA",
    "alpha3": "UKR",
    "latitude": 48.379433,
    "longitude": 31.16558,
    "name": "Ukraine"
  },
  {
    "alpha2": "UG",
    "alpha3": "UGA",
    "latitude": 1.373333,
    "longitude": 32.290275,
    "name": "Uganda"
  },
  {
    "alpha2": "UM",
    "alpha3": "UMI",
    "latitude": 28.202122,
    "longitude": -177.380452,
    "name": "U.S. Minor Outlying Islands"
  },
  {
    "alpha2": "US",
    "alpha3": "USA",
    "latitude": 37.09024,
    "longitude": -95.712891,
    "name": "United States"
  },
  {
    "alpha2": "UY",
    "alpha3": "URY",
    "latitude": -32.522779,
    "longitude": -55.765835,
    "name": "Uruguay"
  },
  {
    "alpha2": "UZ",
    "alpha3": "UZB",
    "latitude": 41.377491,
    "longitude": 64.585262,
    "name": "Uzbekistan"
  },
  {
    "alpha2": "VA",
    "alpha3": "VAT",
    "latitude": 41.902916,
    "longitude": 12.453389,
    "name": "Vatican City"
  },
  {
    "alpha2": "VC",
    "alpha3": "VCT",
    "latitude": 12.984305,
    "longitude": -61.287228,
    "name": "Saint Vincent and the Grenadines"
  },
  {
    "alpha2": "VE",
    "alpha3": "VEN",
    "latitude": 6.42375,
    "longitude": -66.58973,
    "name": "Venezuela"
  },
  {
    "alpha2": "VG",
    "alpha3": "VGB",
    "latitude": 18.420695,
    "longitude": -64.639968,
    "name": "British Virgin Islands"
  },
  {
    "alpha2": "VI",
    "alpha3": "VIR",
    "latitude": 18.335765,
    "longitude": -64.896335,
    "name": "U.S. Virgin Islands"
  },
  {
    "alpha2": "VN",
    "alpha3": "VNM",
    "latitude": 14.058324,
    "longitude": 108.277199,
    "name": "Vietnam"
  },
  {
    "alpha2": "VU",
    "alpha3": "VUT",
    "latitude": -15.376706,
    "longitude": 166.959158,
    "name": "Vanuatu"
  },
  {
    "alpha2": "WF",
    "alpha3": "WLF",
    "latitude": -13.768752,
    "longitude": -177.156097,
    "name": "Wallis and Futuna"
  },
  {
    "alpha2": "WS",
    "alpha3": "WSM",
    "latitude": -13.759029,
    "longitude": -172.104629,
    "name": "Samoa"
  },
  {
    "alpha2": "XK",
    "alpha3": "XKX",
    "latitude": 42.602636,
    "longitude": 20.902977,
    "name": "Kosovo"
  },
  {
    "alpha2": "YE",
    "alpha3": "YEM",
    "latitude": 15.552727,
    "longitude": 48.516388,
    "name": "Yemen"
  },
  {
    "alpha2": "YT",
    "alpha3": "MYT",
    "latitude": -12.8275,
    "longitude": 45.166244,
    "name": "Mayotte"
  },
  {
    "alpha2": "ZA",
    "alpha3": "ZAF",
    "latitude": -30.559482,
    "longitude": 22.937506,
    "name": "South Africa"
  },
  {
    "alpha2": "ZM",
    "alpha3": "ZMB",
    "latitude": -13.133897,
    "longitude": 27.849332,
    "name": "Zambia"
  },
  {
    "alpha2": "ZW",
    "alpha3": "ZWE",
    "latitude": -19.015438,
    "longitude": 29.154857,
    "name": "Zimbabwe"
  }
]

const neighbors = {
      "AD":{
      "id":3041565,
          "neighbours":[
          "FR",
          "ES"
      ]
  },
      "AE":{
      "id":290557,
          "neighbours":[
          "OM",
          "SA"
      ]
  },
      "AF":{
      "id":1149361,
          "neighbours":[
          "CN",
          "IR",
          "PK",
          "TJ",
          "TM",
          "UZ"
      ]
  },
      "AG":{
      "id":3576396,
          "neighbours":[

      ]
  },
      "AI":{
      "id":3573511,
          "neighbours":[

      ]
  },
      "AL":{
      "id":783754,
          "neighbours":[
          "GR",
          "XK",
          "MK",
          "ME",
          "RS"
      ]
  },
      "AM":{
      "id":174982,
          "neighbours":[
          "AZ",
          "GE",
          "IR",
          "TR"
      ]
  },
      "AO":{
      "id":3351879,
          "neighbours":[
          "CD",
          "NA",
          "CG",
          "ZM"
      ]
  },
      "AQ":{
      "id":6697173,
          "neighbours":[

      ]
  },
      "AR":{
      "id":3865483,
          "neighbours":[
          "BO",
          "BR",
          "CL",
          "PY",
          "UY"
      ]
  },
      "AS":{
      "id":5880801,
          "neighbours":[

      ]
  },
      "AT":{
      "id":2782113,
          "neighbours":[
          "CZ",
          "DE",
          "HU",
          "IT",
          "LI",
          "SK",
          "SI",
          "CH"
      ]
  },
      "AU":{
      "id":2077456,
          "neighbours":[

      ]
  },
      "AW":{
      "id":3577279,
          "neighbours":[

      ]
  },
      "AX":{
      "id":661882,
          "neighbours":[

      ]
  },
      "AZ":{
      "id":587116,
          "neighbours":[
          "AM",
          "GE",
          "IR",
          "RU",
          "TR"
      ]
  },
      "BA":{
      "id":3277605,
          "neighbours":[
          "HR",
          "ME",
          "RS"
      ]
  },
      "BB":{
      "id":3374084,
          "neighbours":[

      ]
  },
      "BD":{
      "id":1210997,
          "neighbours":[
          "IN",
          "MM"
      ]
  },
      "BE":{
      "id":2802361,
          "neighbours":[
          "FR",
          "DE",
          "LU",
          "NL"
      ]
  },
      "BF":{
      "id":2361809,
          "neighbours":[
          "BJ",
          "GH",
          "CI",
          "ML",
          "NE",
          "TG"
      ]
  },
      "BG":{
      "id":732800,
          "neighbours":[
          "GR",
          "MK",
          "RO",
          "RS",
          "TR"
      ]
  },
      "BH":{
      "id":290291,
          "neighbours":[

      ]
  },
      "BI":{
      "id":433561,
          "neighbours":[
          "CD",
          "RW",
          "TZ"
      ]
  },
      "BJ":{
      "id":2395170,
          "neighbours":[
          "BF",
          "NE",
          "NG",
          "TG"
      ]
  },
      "BL":{
      "id":3578476,
          "neighbours":[

      ]
  },
      "BM":{
      "id":3573345,
          "neighbours":[

      ]
  },
      "BN":{
      "id":1820814,
          "neighbours":[
          "MY"
      ]
  },
      "BO":{
      "id":3923057,
          "neighbours":[
          "AR",
          "BR",
          "CL",
          "PY",
          "PE"
      ]
  },
      "BQ":{
      "id":7626844,
          "neighbours":[

      ]
  },
      "BR":{
      "id":3469034,
          "neighbours":[
          "AR",
          "BO",
          "CO",
          "GF",
          "GY",
          "PY",
          "PE",
          "SR",
          "UY",
          "VE"
      ]
  },
      "BS":{
      "id":3572887,
          "neighbours":[
        "US",
        "CU"
      ]
  },
      "BT":{
      "id":1252634,
          "neighbours":[
          "CN",
          "IN"
      ]
  },
      "BV":{
      "id":3371123,
          "neighbours":[

      ]
  },
      "BW":{
      "id":933860,
          "neighbours":[
          "NA",
          "ZA",
          "ZW"
      ]
  },
      "BY":{
      "id":630336,
          "neighbours":[
          "LV",
          "LT",
          "PL",
          "RU",
          "UA"
      ]
  },
      "BZ":{
      "id":3582678,
          "neighbours":[
          "GT",
          "MX"
      ]
  },
      "CA":{
      "id":6251999,
          "neighbours":[
          "US"
      ]
  },
      "CC":{
      "id":1547376,
          "neighbours":[

      ]
  },
      "CD":{
      "id":203312,
          "neighbours":[
          "AO",
          "BI",
          "CF",
          "CG",
          "RW",
          "SS",
          "TZ",
          "UG",
          "ZM"
      ]
  },
      "CF":{
      "id":239880,
          "neighbours":[
          "CM",
          "TD",
          "CD",
          "CG",
          "SS",
          "SD"
      ]
  },
      "CG":{
      "id":2260494,
          "neighbours":[
          "AO",
          "CM",
          "CF",
          "CD",
          "GA"
      ]
  },
      "CH":{
      "id":2658434,
          "neighbours":[
          "AT",
          "FR",
          "DE",
          "IT",
          "LI"
      ]
  },
      "CI":{
      "id":2287781,
          "neighbours":[
          "BF",
          "GH",
          "GN",
          "LR",
          "ML"
      ]
  },
      "CK":{
      "id":1899402,
          "neighbours":[

      ]
  },
      "CL":{
      "id":3895114,
          "neighbours":[
          "AR",
          "BO",
          "PE"
      ]
  },
      "CM":{
      "id":2233387,
          "neighbours":[
          "CF",
          "TD",
          "GQ",
          "GA",
          "NG",
          "CG"
      ]
  },
      "CN":{
      "id":1814991,
          "neighbours":[
          "AF",
          "BT",
          "IN",
          "KZ",
          "KG",
          "LA",
          "MN",
          "MM",
          "NP",
          "KP",
          "PK",
          "RU",
          "TJ",
          "VN",
          "JP"
      ]
  },
      "CO":{
      "id":3686110,
          "neighbours":[
          "BR",
          "EC",
          "PA",
          "PE",
          "VE"
      ]
  },
      "CR":{
      "id":3624060,
          "neighbours":[
          "NI",
          "PA"
      ]
  },
      "CU":{
      "id":3562981,
          "neighbours":[
          "US"
      ]
  },
      "CV":{
      "id":3374766,
          "neighbours":[

      ]
  },
      "CW":{
      "id":7626836,
          "neighbours":[

      ]
  },
      "CX":{
      "id":2078138,
          "neighbours":[

      ]
  },
      "CY":{
      "id":146669,
          "neighbours":[

      ]
  },
      "CZ":{
      "id":3077311,
          "neighbours":[
          "AT",
          "DE",
          "PL",
          "SK"
      ]
  },
      "DE":{
      "id":2921044,
          "neighbours":[
          "AT",
          "BE",
          "CZ",
          "DK",
          "FR",
          "LU",
          "NL",
          "PL",
          "CH"
      ]
  },
      "DJ":{
      "id":223816,
          "neighbours":[
          "ER",
          "ET",
          "SO"
      ]
  },
      "DK":{
      "id":2623032,
          "neighbours":[
          "DE"
      ]
  },
      "DM":{
      "id":3575830,
          "neighbours":[

      ]
  },
      "DO":{
      "id":3508796,
          "neighbours":[
          "HT"
      ]
  },
      "DZ":{
      "id":2589581,
          "neighbours":[
          "LY",
          "ML",
          "MR",
          "MA",
          "NE",
          "TN",
          "EH"
      ]
  },
      "EC":{
      "id":3658394,
          "neighbours":[
          "CO",
          "PE"
      ]
  },
      "EE":{
      "id":453733,
          "neighbours":[
          "LV",
          "RU"
      ]
  },
      "EG":{
      "id":357994,
          "neighbours":[
          "IL",
          "LY",
          "SD"
      ]
  },
      "EH":{
      "id":2461445,
          "neighbours":[

      ]
  },
      "ER":{
      "id":338010,
          "neighbours":[
          "DJ",
          "ET",
          "SD"
      ]
  },
      "ES":{
      "id":2510769,
          "neighbours":[
          "AD",
          "FR",
          "GI",
          "MA",
          "PT"
      ]
  },
      "ET":{
      "id":337996,
          "neighbours":[
          "DJ",
          "ER",
          "KE",
          "SO",
          "SS",
          "SD"
      ]
  },
      "FI":{
      "id":660013,
          "neighbours":[
          "NO",
          "RU",
          "SE"
      ]
  },
      "FJ":{
      "id":2205218,
          "neighbours":[

      ]
  },
      "FK":{
      "id":3474414,
          "neighbours":[

      ]
  },
      "FM":{
      "id":2081918,
          "neighbours":[

      ]
  },
      "FO":{
      "id":2622320,
          "neighbours":[

      ]
  },
      "FR":{
      "id":3017382,
          "neighbours":[
          "AD",
          "BE",
          "DE",
          "IT",
          "LU",
          "MC",
          "ES",
          "CH"
      ]
  },
      "GA":{
      "id":2400553,
          "neighbours":[
          "CM",
          "GQ",
          "CG"
      ]
  },
      "GB":{
      "id":2635167,
          "neighbours":[
          "IE"
      ]
  },
      "GD":{
      "id":3580239,
          "neighbours":[

      ]
  },
      "GE":{
      "id":614540,
          "neighbours":[
          "AM",
          "AZ",
          "RU",
          "TR"
      ]
  },
      "GF":{
      "id":3381670,
          "neighbours":[
          "BR",
          "SR"
      ]
  },
      "GG":{
      "id":3042362,
          "neighbours":[

      ]
  },
      "GH":{
      "id":2300660,
          "neighbours":[
          "BF",
          "CI",
          "TG"
      ]
  },
      "GI":{
      "id":2411586,
          "neighbours":[
          "ES"
      ]
  },
      "GL":{
      "id":3425505,
          "neighbours":[

      ]
  },
      "GM":{
      "id":2413451,
          "neighbours":[
          "SN"
      ]
  },
      "GN":{
      "id":2420477,
          "neighbours":[
          "GW",
          "CI",
          "LR",
          "ML",
          "SN",
          "SL"
      ]
  },
      "GP":{
      "id":3579143,
          "neighbours":[

      ]
  },
      "GQ":{
      "id":2309096,
          "neighbours":[
          "CM",
          "GA"
      ]
  },
      "GR":{
      "id":390903,
          "neighbours":[
          "AL",
          "BG",
          "MK",
          "TR"
      ]
  },
      "GS":{
      "id":3474415,
          "neighbours":[

      ]
  },
      "GT":{
      "id":3595528,
          "neighbours":[
          "BZ",
          "SV",
          "HN",
          "MX"
      ]
  },
      "GU":{
      "id":4043988,
          "neighbours":[

      ]
  },
      "GW":{
      "id":2372248,
          "neighbours":[
          "GN",
          "SN"
      ]
  },
      "GY":{
      "id":3378535,
          "neighbours":[
          "BR",
          "SR",
          "VE"
      ]
  },
      "HK":{
      "id":1819730,
          "neighbours":[

      ]
  },
      "HM":{
      "id":1547314,
          "neighbours":[

      ]
  },
      "HN":{
      "id":3608932,
          "neighbours":[
          "SV",
          "GT",
          "NI"
      ]
  },
      "HR":{
      "id":3202326,
          "neighbours":[
          "BA",
          "HU",
          "ME",
          "RS",
          "SI"
      ]
  },
      "HT":{
      "id":3723988,
          "neighbours":[
          "DO"
      ]
  },
      "HU":{
      "id":719819,
          "neighbours":[
          "AT",
          "HR",
          "RO",
          "RS",
          "SK",
          "SI",
          "UA"
      ]
  },
      "ID":{
      "id":1643084,
          "neighbours":[
          "TL",
          "MY",
          "PG"
      ]
  },
      "IE":{
      "id":2963597,
          "neighbours":[
          "GB"
      ]
  },
      "IL":{
      "id":294640,
          "neighbours":[
          "EG",
          "JO",
          "LB",
          "PS",
          "SY"
      ]
  },
      "IM":{
      "id":3042225,
          "neighbours":[

      ]
  },
      "IN":{
      "id":1269750,
          "neighbours":[
          "BD",
          "BT",
          "CN",
          "MM",
          "NP",
          "PK"
      ]
  },
      "IO":{
      "id":1282588,
          "neighbours":[

      ]
  },
      "IQ":{
      "id":99237,
          "neighbours":[
          "IR",
          "JO",
          "KW",
          "SA",
          "SY",
          "TR"
      ]
  },
      "IR":{
      "id":130758,
          "neighbours":[
          "AF",
          "AM",
          "AZ",
          "IQ",
          "PK",
          "TR",
          "TM"
      ]
  },
      "IS":{
      "id":2629691,
          "neighbours":[

      ]
  },
      "IT":{
      "id":3175395,
          "neighbours":[
          "AT",
          "FR",
          "SM",
          "SI",
          "CH",
          "VA"
      ]
  },
      "JE":{
      "id":3042142,
          "neighbours":[

      ]
  },
      "JM":{
      "id":3489940,
          "neighbours":[

      ]
  },
      "JO":{
      "id":248816,
          "neighbours":[
          "IQ",
          "IL",
          "PS",
          "SA",
          "SY"
      ]
  },
      "JP":{
      "id":1861060,
          "neighbours":[
        "CN",
      ]
  },
      "KE":{
      "id":192950,
          "neighbours":[
          "ET",
          "SO",
          "SS",
          "TZ",
          "UG"
      ]
  },
      "KG":{
      "id":1527747,
          "neighbours":[
          "CN",
          "KZ",
          "TJ",
          "UZ"
      ]
  },
      "KH":{
      "id":1831722,
          "neighbours":[
          "LA",
          "TH",
          "VN"
      ]
  },
      "KI":{
      "id":4030945,
          "neighbours":[

      ]
  },
      "KM":{
      "id":921929,
          "neighbours":[

      ]
  },
      "KN":{
      "id":3575174,
          "neighbours":[

      ]
  },
      "KP":{
      "id":1873107,
          "neighbours":[
          "CN",
          "RU",
          "KR"
      ]
  },
      "KR":{
      "id":1835841,
          "neighbours":[
          "KP"
      ]
  },
      "KW":{
      "id":285570,
          "neighbours":[
          "IQ",
          "SA"
      ]
  },
      "KY":{
      "id":3580718,
          "neighbours":[

      ]
  },
      "KZ":{
      "id":1522867,
          "neighbours":[
          "CN",
          "KG",
          "RU",
          "TM",
          "UZ"
      ]
  },
      "LA":{
      "id":1655842,
          "neighbours":[
          "KH",
          "CN",
          "MM",
          "TH",
          "VN"
      ]
  },
      "LB":{
      "id":272103,
          "neighbours":[
          "IL",
          "SY"
      ]
  },
      "LC":{
      "id":3576468,
          "neighbours":[

      ]
  },
      "LI":{
      "id":3042058,
          "neighbours":[
          "AT",
          "CH"
      ]
  },
      "LK":{
      "id":1227603,
          "neighbours":[

      ]
  },
      "LR":{
      "id":2275384,
          "neighbours":[
          "GN",
          "CI",
          "SL"
      ]
  },
      "LS":{
      "id":932692,
          "neighbours":[
          "ZA"
      ]
  },
      "LT":{
      "id":597427,
          "neighbours":[
          "BY",
          "LV",
          "PL",
          "RU"
      ]
  },
      "LU":{
      "id":2960313,
          "neighbours":[
          "BE",
          "FR",
          "DE"
      ]
  },
      "LV":{
      "id":458258,
          "neighbours":[
          "BY",
          "EE",
          "LT",
          "RU"
      ]
  },
      "LY":{
      "id":2215636,
          "neighbours":[
          "DZ",
          "TD",
          "EG",
          "NE",
          "SD",
          "TN"
      ]
  },
      "MA":{
      "id":2542007,
          "neighbours":[
          "DZ",
          "ES",
          "EH"
      ]
  },
      "MC":{
      "id":2993457,
          "neighbours":[
          "FR"
      ]
  },
      "MD":{
      "id":617790,
          "neighbours":[
          "RO",
          "UA"
      ]
  },
      "ME":{
      "id":3194884,
          "neighbours":[
          "AL",
          "BA",
          "HR",
          "XK",
          "RS"
      ]
  },
      "MF":{
      "id":3578421,
          "neighbours":[
          "SX"
      ]
  },
      "MG":{
      "id":1062947,
          "neighbours":[

      ]
  },
      "MH":{
      "id":2080185,
          "neighbours":[

      ]
  },
      "MK":{
      "id":718075,
          "neighbours":[
          "AL",
          "BG",
          "GR",
          "XK",
          "RS"
      ]
  },
      "ML":{
      "id":2453866,
          "neighbours":[
          "DZ",
          "BF",
          "GN",
          "CI",
          "MR",
          "NE",
          "SN"
      ]
  },
      "MM":{
      "id":1327865,
          "neighbours":[
          "BD",
          "CN",
          "IN",
          "LA",
          "TH"
      ]
  },
      "MN":{
      "id":2029969,
          "neighbours":[
          "CN",
          "RU"
      ]
  },
      "MO":{
      "id":1821275,
          "neighbours":[

      ]
  },
      "MP":{
      "id":4041468,
          "neighbours":[

      ]
  },
      "MQ":{
      "id":3570311,
          "neighbours":[

      ]
  },
      "MR":{
      "id":2378080,
          "neighbours":[
          "DZ",
          "ML",
          "SN",
          "EH"
      ]
  },
      "MS":{
      "id":3578097,
          "neighbours":[

      ]
  },
      "MT":{
      "id":2562770,
          "neighbours":[

      ]
  },
      "MU":{
      "id":934292,
          "neighbours":[

      ]
  },
      "MV":{
      "id":1282028,
          "neighbours":[

      ]
  },
      "MW":{
      "id":927384,
          "neighbours":[
          "MZ",
          "TZ",
          "ZM"
      ]
  },
      "MX":{
      "id":3996063,
          "neighbours":[
          "BZ",
          "GT",
          "US"
      ]
  },
      "MY":{
      "id":1733045,
          "neighbours":[
          "BN",
          "ID",
          "TH"
      ]
  },
      "MZ":{
      "id":1036973,
          "neighbours":[
          "MW",
          "ZA",
          "SZ",
          "TZ",
          "ZM",
          "ZW"
      ]
  },
      "NA":{
      "id":3355338,
          "neighbours":[
          "AO",
          "BW",
          "ZA",
          "ZM"
      ]
  },
      "NC":{
      "id":2139685,
          "neighbours":[

      ]
  },
      "NE":{
      "id":2440476,
          "neighbours":[
          "DZ",
          "BJ",
          "BF",
          "TD",
          "LY",
          "ML",
          "NG"
      ]
  },
      "NF":{
      "id":2155115,
          "neighbours":[

      ]
  },
      "NG":{
      "id":2328926,
          "neighbours":[
          "BJ",
          "CM",
          "TD",
          "NE"
      ]
  },
      "NI":{
      "id":3617476,
          "neighbours":[
          "CR",
          "HN"
      ]
  },
      "NL":{
      "id":2750405,
          "neighbours":[
          "BE",
          "DE"
      ]
  },
      "NO":{
      "id":3144096,
          "neighbours":[
          "FI",
          "RU",
          "SE"
      ]
  },
      "NP":{
      "id":1282988,
          "neighbours":[
          "CN",
          "IN"
      ]
  },
      "NR":{
      "id":2110425,
          "neighbours":[

      ]
  },
      "NU":{
      "id":4036232,
          "neighbours":[

      ]
  },
      "NZ":{
      "id":2186224,
          "neighbours":[

      ]
  },
      "OM":{
      "id":286963,
          "neighbours":[
          "SA",
          "AE",
          "YE"
      ]
  },
      "PA":{
      "id":3703430,
          "neighbours":[
          "CO",
          "CR"
      ]
  },
      "PE":{
      "id":3932488,
          "neighbours":[
          "BO",
          "BR",
          "CL",
          "CO",
          "EC"
      ]
  },
      "PF":{
      "id":4030656,
          "neighbours":[

      ]
  },
      "PG":{
      "id":2088628,
          "neighbours":[
          "ID"
      ]
  },
      "PH":{
      "id":1694008,
          "neighbours":[

      ]
  },
      "PK":{
      "id":1168579,
          "neighbours":[
          "AF",
          "CN",
          "IN",
          "IR"
      ]
  },
      "PL":{
      "id":798544,
          "neighbours":[
          "BY",
          "CZ",
          "DE",
          "LT",
          "RU",
          "SK",
          "UA"
      ]
  },
      "PM":{
      "id":3424932,
          "neighbours":[

      ]
  },
      "PN":{
      "id":4030699,
          "neighbours":[

      ]
  },
      "PR":{
      "id":4566966,
          "neighbours":[

      ]
  },
      "PS":{
      "id":6254930,
          "neighbours":[
          "IL",
          "JO"
      ]
  },
      "PT":{
      "id":2264397,
          "neighbours":[
          "ES"
      ]
  },
      "PW":{
      "id":1559582,
          "neighbours":[

      ]
  },
      "PY":{
      "id":3437598,
          "neighbours":[
          "AR",
          "BO",
          "BR"
      ]
  },
      "QA":{
      "id":289688,
          "neighbours":[
          "SA"
      ]
  },
      "RE":{
      "id":935317,
          "neighbours":[

      ]
  },
      "RO":{
      "id":798549,
          "neighbours":[
          "BG",
          "HU",
          "MD",
          "RS",
          "UA"
      ]
  },
      "RS":{
      "id":6290252,
          "neighbours":[
          "AL",
          "BA",
          "BG",
          "HR",
          "HU",
          "XK",
          "MK",
          "ME",
          "RO"
      ]
  },
      "RU":{
      "id":2017370,
          "neighbours":[
          "AZ",
          "BY",
          "CN",
          "EE",
          "FI",
          "GE",
          "KZ",
          "LV",
          "LT",
          "MN",
          "KP",
          "NO",
          "PL",
          "UA"
      ]
  },
      "RW":{
      "id":49518,
          "neighbours":[
          "BI",
          "CD",
          "TZ",
          "UG"
      ]
  },
      "SA":{
      "id":102358,
          "neighbours":[
          "IQ",
          "JO",
          "KW",
          "OM",
          "QA",
          "AE",
          "YE"
      ]
  },
      "SB":{
      "id":2103350,
          "neighbours":[

      ]
  },
      "SC":{
      "id":241170,
          "neighbours":[

      ]
  },
      "SD":{
      "id":366755,
          "neighbours":[
          "CF",
          "TD",
          "EG",
          "ER",
          "ET",
          "LY",
          "SS"
      ]
  },
      "SE":{
      "id":2661886,
          "neighbours":[
          "FI",
          "NO"
      ]
  },
      "SG":{
      "id":1880251,
          "neighbours":[

      ]
  },
      "SH":{
      "id":3370751,
          "neighbours":[

      ]
  },
      "SI":{
      "id":3190538,
          "neighbours":[
          "AT",
          "HR",
          "HU",
          "IT"
      ]
  },
      "SJ":{
      "id":607072,
          "neighbours":[

      ]
  },
      "SK":{
      "id":3057568,
          "neighbours":[
          "AT",
          "CZ",
          "HU",
          "PL",
          "UA"
      ]
  },
      "SL":{
      "id":2403846,
          "neighbours":[
          "GN",
          "LR"
      ]
  },
      "SM":{
      "id":3168068,
          "neighbours":[
          "IT"
      ]
  },
      "SN":{
      "id":2245662,
          "neighbours":[
          "GM",
          "GN",
          "GW",
          "ML",
          "MR"
      ]
  },
      "SO":{
      "id":51537,
          "neighbours":[
          "DJ",
          "ET",
          "KE"
      ]
  },
      "SR":{
      "id":3382998,
          "neighbours":[
          "BR",
          "GF",
          "GY"
      ]
  },
      "SS":{
      "id":7909807,
          "neighbours":[
          "CF",
          "CD",
          "ET",
          "KE",
          "SD",
          "UG"
      ]
  },
      "ST":{
      "id":2410758,
          "neighbours":[

      ]
  },
      "SV":{
      "id":3585968,
          "neighbours":[
          "GT",
          "HN"
      ]
  },
      "SX":{
      "id":7609695,
          "neighbours":[
          "MF"
      ]
  },
      "SY":{
      "id":163843,
          "neighbours":[
          "IQ",
          "IL",
          "JO",
          "LB",
          "TR"
      ]
  },
      "SZ":{
      "id":934841,
          "neighbours":[
          "MZ",
          "ZA"
      ]
  },
      "TC":{
      "id":3576916,
          "neighbours":[

      ]
  },
      "TD":{
      "id":2434508,
          "neighbours":[
          "CM",
          "CF",
          "LY",
          "NE",
          "NG",
          "SD"
      ]
  },
      "TF":{
      "id":1546748,
          "neighbours":[

      ]
  },
      "TG":{
      "id":2363686,
          "neighbours":[
          "BJ",
          "BF",
          "GH"
      ]
  },
      "TH":{
      "id":1605651,
          "neighbours":[
          "KH",
          "LA",
          "MY",
          "MM"
      ]
  },
      "TJ":{
      "id":1220409,
          "neighbours":[
          "AF",
          "CN",
          "KG",
          "UZ"
      ]
  },
      "TK":{
      "id":4031074,
          "neighbours":[

      ]
  },
      "TL":{
      "id":1966436,
          "neighbours":[
          "ID"
      ]
  },
      "TM":{
      "id":1218197,
          "neighbours":[
          "AF",
          "IR",
          "KZ",
          "UZ"
      ]
  },
      "TN":{
      "id":2464461,
          "neighbours":[
          "DZ",
          "LY"
      ]
  },
      "TO":{
      "id":4032283,
          "neighbours":[

      ]
  },
      "TR":{
      "id":298795,
          "neighbours":[
          "AM",
          "AZ",
          "BG",
          "GE",
          "GR",
          "IR",
          "IQ",
          "SY"
      ]
  },
      "TT":{
      "id":3573591,
          "neighbours":[

      ]
  },
      "TV":{
      "id":2110297,
          "neighbours":[

      ]
  },
      "TW":{
      "id":1668284,
          "neighbours":[

      ]
  },
      "TZ":{
      "id":149590,
          "neighbours":[
          "BI",
          "CD",
          "KE",
          "MW",
          "MZ",
          "RW",
          "UG",
          "ZM"
      ]
  },
      "UA":{
      "id":690791,
          "neighbours":[
          "BY",
          "HU",
          "MD",
          "PL",
          "RO",
          "RU",
          "SK"
      ]
  },
      "UG":{
      "id":226074,
          "neighbours":[
          "CD",
          "KE",
          "RW",
          "SS",
          "TZ"
      ]
  },
      "UM":{
      "id":5854968,
          "neighbours":[

      ]
  },
      "US":{
      "id":6252001,
          "neighbours":[
          "CA",
          "CU",
          "MX"
      ]
  },
      "UY":{
      "id":3439705,
          "neighbours":[
          "AR",
          "BR"
      ]
  },
      "UZ":{
      "id":1512440,
          "neighbours":[
          "AF",
          "KZ",
          "KG",
          "TJ",
          "TM"
      ]
  },
      "VA":{
      "id":3164670,
          "neighbours":[
          "IT"
      ]
  },
      "VC":{
      "id":3577815,
          "neighbours":[

      ]
  },
      "VE":{
      "id":3625428,
          "neighbours":[
          "BR",
          "CO",
          "GY"
      ]
  },
      "VG":{
      "id":3577718,
          "neighbours":[

      ]
  },
      "VI":{
      "id":4796775,
          "neighbours":[

      ]
  },
      "VN":{
      "id":1562822,
          "neighbours":[
          "KH",
          "CN",
          "LA"
      ]
  },
      "VU":{
      "id":2134431,
          "neighbours":[

      ]
  },
      "WF":{
      "id":4034749,
          "neighbours":[

      ]
  },
      "WS":{
      "id":4034894,
          "neighbours":[

      ]
  },
      "XK":{
      "id":831053,
          "neighbours":[
          "AL",
          "MK",
          "ME",
          "RS"
      ]
  },
      "YE":{
      "id":69543,
          "neighbours":[
          "OM",
          "SA"
      ]
  },
      "YT":{
      "id":1024031,
          "neighbours":[

      ]
  },
      "ZA":{
      "id":953987,
          "neighbours":[
          "BW",
          "LS",
          "MZ",
          "NA",
          "SZ",
          "ZW"
      ]
  },
      "ZM":{
      "id":895949,
          "neighbours":[
          "AO",
          "CD",
          "MW",
          "MZ",
          "NA",
          "TZ",
          "ZW"
      ]
  },
      "ZW":{
      "id":878675,
          "neighbours":[
          "BW",
          "MZ",
          "ZA",
          "ZM"
      ]
  }
}
