import { useState, useEffect } from 'react'
import { useCitiesStore } from '../../store/citiesStore'
import { City } from '../../store/experienceStore'

interface PropsSelectCity {
  handleCityChange: (city: City) => void
  selectedCity?: City
}

const SelectCity = ({ handleCityChange, selectedCity }: PropsSelectCity) => {
  const { continents, cities, loading, fetchCities, getCountriesByContinent, getCitiesByCountry } = useCitiesStore()
  
  const [selectedContinent, setSelectedContinent] = useState<string>('')
  const [selectedCountry, setSelectedCountry] = useState<string>('')
  const [countryOptions, setCountryOptions] = useState<string[]>([])
  const [cityOptions, setCityOptions] = useState<City[]>([])

  // Fetch cities on mount
  useEffect(() => {
    fetchCities()
  }, [fetchCities])

  // When continent changes, update countries
  useEffect(() => {
    if (selectedContinent) {
      const countries = getCountriesByContinent(selectedContinent)
      setCountryOptions(countries)
      setSelectedCountry('')
      setCityOptions([])
    } else {
      setCountryOptions([])
      setCityOptions([])
    }
  }, [selectedContinent, getCountriesByContinent])

  // When country changes, update cities
  useEffect(() => {
    if (selectedCountry) {
      const citiesInCountry = getCitiesByCountry(selectedCountry)
      setCityOptions(citiesInCountry)
    } else {
      setCityOptions([])
    }
  }, [selectedCountry, getCitiesByCountry])

  const handleContinentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedContinent(e.target.value)
  }

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value)
  }

  const handleCityInternalChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value
    const city = cityOptions.find(c => c._id === cityId)
    if (city) {
      handleCityChange(city)
    }
  }

  if (loading) return <div>Loading cities...</div>

  return <div className="select_city_group">
    <select 
      name="continent" 
      className="form_control" 
      onChange={handleContinentChange}
      value={selectedContinent}
    >
      <option value="">Select Continent</option>
      {continents.map(continent => (
        <option key={continent} value={continent}>
          {continent}
        </option>
      ))}
    </select>

    <select 
      name="country" 
      className="form_control" 
      onChange={handleCountryChange}
      value={selectedCountry}
      disabled={!selectedContinent}
    >
      <option value="">Select Country</option>
      {countryOptions.map(country => (
        <option key={country} value={country}>
          {country}
        </option>
      ))}
    </select>

    <select 
      name="city" 
      className="form_control" 
      onChange={handleCityInternalChange}
      disabled={!selectedCountry}
    >
      <option value="">Select City</option>
      {cityOptions.map(city => (
        <option key={city._id} value={city._id}>
          {city.name}
        </option>
      ))}
    </select>
  </div>
}

export default SelectCity
