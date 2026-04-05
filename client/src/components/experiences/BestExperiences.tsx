import { useBestExperiences } from '../../hooks/useExperienceHooks'
import Card from '../common/Card'

const BestExperiences = () => {
  const { bestExperiences, loading, error } = useBestExperiences()

  return <div className="modLastExps">
    <h2>Best Experiences</h2>

    <div className="flex">
      {
        !loading && bestExperiences.map((ele) => {

          return <Card
            key={`bestExp-${ele._id}`}
            _id={ele._id}
            title={ele.title}
            category={ele.category}
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

export default BestExperiences