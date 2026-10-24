import { postData } from '@/utils/utils'
import { API } from '@/config'
import type { City, NewCity } from './types'

// Returns the existing city when name + country code already exist
export const saveCity = async (city: NewCity) => (await postData<{ city: City }>(`${API}/cities`, city)).data.city
