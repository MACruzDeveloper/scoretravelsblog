import { useLastExperiences } from '@/hooks/useExperienceHooks'
import Card from '../common/Card'

const LastExperiences = () => {
  const { lastExperiences, loading, error } = useLastExperiences()

  return <div className="modLastExps">
    <h2>Last Experiences</h2>

    <div className="flex">
      {
        !loading && lastExperiences.map(ele => {

          return <Card
            key={`lastExp-${ele._id}`}
            _id={ele._id}
            title={ele.title}
            category={ele.category}
            city={ele.city}
            content={ele.content}
            date={ele.date}
            score={ele.score}
            image={ele.image}
          />
        })
      }
      {error}
    </div>
  </div>
}

export default LastExperiences