import { useState, useEffect } from 'react'
import { getData } from '@utils/utils'

export type PropsSelectContinent = {
  handleChange: any
  selected?: string
}

interface Continent {
  continents: string[]
}

const SelectContinent = ({ handleChange, selected }: PropsSelectContinent) => {
  const [continents, setContinents] = useState<string[]>([])

  // Get continents from public api
  // new Set to store unique values
  const getContinents = async () => {
    try {
      const res = await getData(`https://restcountries.com/v3.1/all?fields=continents`)
      const data = res.data as Continent[]
      const uniqueContinents = [...new Set(data.map((entry) => entry.continents).flat())].sort()
      setContinents(uniqueContinents)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getContinents()
  }, [])

  return <select name="continent" className="form_control" onChange={handleChange} defaultValue={selected}>
      <option>Continent</option>
      {
        continents.map((continent) => {
          return <option key={continent} value={continent}>
            {continent}
          </option>
        })
      }
    </select>
  }

export default SelectContinent