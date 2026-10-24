import { MdLaptopMac, MdSchool, MdWork } from 'react-icons/md'
import type { IconType } from 'react-icons'
import type { MilestoneType } from '@/data/career'

// Icon of each kind of milestone; the color comes from the `type_<name>` class
export const TYPE_ICONS: Record<MilestoneType, IconType> = {
  education: MdSchool,
  work: MdWork,
  freelance: MdLaptopMac,
}
