/**
 * Recomputes score (average) and votes (count) of every experience that has votes.
 * Experiences without votes keep their current score (e.g. seeded ones).
 *
 * Usage:
 *   node scripts/recalculate-scores.js          # dry run, only prints what would change
 *   node scripts/recalculate-scores.js --apply  # writes the changes
 */
require('dotenv').config({ quiet: true })

const mongoose = require('mongoose')
const Experiences = require('../models/experiencesModel')
const Scores = require('../models/scoresModel')
const { recalculateExperienceScore } = require('../services/scoreService')

const apply = process.argv.includes('--apply')

async function main() {
  if (!process.env.ATLAS_URL) {
    console.error('ERROR: Missing ATLAS_URL in server/.env')
    process.exit(1)
  }
  await mongoose.connect(process.env.ATLAS_URL)
  console.log(apply ? 'APPLYING changes' : 'DRY RUN (use --apply to write changes)')

  const votedIds = await Scores.distinct('experience')
  const experiences = await Experiences.find({ _id: { $in: votedIds.filter((id) => mongoose.isValidObjectId(id)) } })
    .select('title score votes').lean()

  for (const exp of experiences) {
    if (apply) {
      const { score, count } = await recalculateExperienceScore(exp._id)
      console.log(`  "${exp.title}": score ${exp.score ?? '-'} -> ${score ?? '-'}, votes -> ${count}`)
    } else {
      console.log(`  "${exp.title}": current score ${exp.score ?? '-'}, votes ${exp.votes ?? 0}`)
    }
  }
  console.log(`${experiences.length} experiences with votes ${apply ? 'updated' : 'would be recalculated'}`)

  await mongoose.disconnect()
}

main().catch(async (err) => {
  console.error(err)
  await mongoose.disconnect()
  process.exit(1)
})
