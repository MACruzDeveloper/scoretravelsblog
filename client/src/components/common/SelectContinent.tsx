import { useState, useEffect } from 'react'
import { getData } from '@utils/utils'

export type PropsSelectContinent = {
  handleChange: any
  selected?: string
}

interface Continent {
  continents: string
}

const SelectContinent = ({ handleChange, selected }: PropsSelectContinent) => {
  const [continents, setContinents] = useState<Array<Continent>>([])

  // Get continents from public api
  // new Set to store unique values
  const getContinents = async () => {
    getData(`https://restcountries.com/v3.1/all?fields=continents`)
      .then((res) => {
        const data = res.data
        const jsonObject = data.map(JSON.stringify)
        const uniqueSet = new Set(jsonObject)
        const uniqueArray = Array.from(uniqueSet).map(JSON.parse)
        setContinents(uniqueArray)
        return uniqueArray
      })
      .catch((err) => console.log(err))
  }

  useEffect(() => {
    getContinents()
  }, [])

  return <select name="continent" className="form_control" onChange={handleChange} defaultValue={selected}>
      <option>Continent</option>
      {
        continents.map((ele) => {
          return <option key={ele.continents} value={ele.continents}>
            {ele.continents}
          </option>
        })
      }
    </select>
  }

export default SelectContinent