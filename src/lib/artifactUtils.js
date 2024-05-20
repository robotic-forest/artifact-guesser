import { isNumeric } from "./utils"

export const convertCountries = country => {
  if (['United States', 'USA', 'US'].includes(country)) return 'United States'
  if (['United Kingdom', 'UK', 'England', 'Great Britain'].includes(country)) return 'United Kingdom'
  if (['South Korea', 'Korea'].includes(country)) return 'South Korea'
  if (['Czech Republic', 'Czechia'].includes(country)) return 'Czech Republic'
  if (['Congo', 'Congo Republic', 'Republic of Congo'].includes(country)) return 'Congo'
  if (['Congo Democratic Republic', 'DR Congo', 'DRC'].includes(country)) return 'Democratic Republic of the Congo'
  if (['Ivory Coast', 'Côte d’Ivoire'].includes(country)) return 'Ivory Coast'
  if (['Burma', 'Myanmar'].includes(country)) return 'Myanmar'
  if (['East Timor', 'Timor-Leste'].includes(country)) return 'Timor-Leste'
  if (['Cape Verde', 'Cabo Verde'].includes(country)) return 'Cape Verde'
  if (['São Tomé and Príncipe', 'Sao Tome and Principe'].includes(country)) return 'São Tomé and Príncipe'

  return country
}

export const formatDate = d => {
  const date = String(d)
  if (!date) return

  if (date.includes('-')) {
    return `${date.replace(/-/g, '')} BC`
  } else {
    return `${date} AD`
  }
}

export const formatLoaction = l => {
  if (!l) return

  let s = ''
  if (l.city) s += l.city + ', '
  if (l.river) s += l.river + ', '
  if (l.state) s += l.state + ', '
  if (l.subregion) s += l.subregion + ', '
  if (l.region) s += l.region + ', '
  if (l.country) s += l.country

  if (s.endsWith(', ')) s = s.slice(0, -2)

  return s
}

export const formatTime = t => {
  if (!t) return

  let s = ''
  if (t.description) s += t.description + ', '
  if (t.period) s += t.period + ', '
  if (t.dynasty) s += t.dynasty + ', '
  if (t.reign) s += t.reign + ', '

  if (!s || isNumeric(s.replace(/-/g, ''))) {
    if (t.start === t.end) return formatDate(t.start)
    return `${formatDate(t.start)} → ${formatDate(t.end)}`
  }

  if (s.endsWith(', ')) s = s.slice(0, -2)
  return s
}