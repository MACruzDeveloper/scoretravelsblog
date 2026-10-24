import { useCallback, useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { MdCheckCircle, MdCancel } from 'react-icons/md'
import { listAllExperiences, reviewExperience } from '@/api/experiences'
import type { Experience } from '@/api/types'
import { useModerationStore } from '@/store/moderationStore'
import { URL } from '@/config'
import { getErrorMessage } from '@/utils/errors'
import FormattedDate from '@/components/common/FormattedDate'
import Msgbox, { ParamsMsgBox } from '@/components/common/Msgbox'
import Spinner from '@/components/common/Spinner'

const EXCERPT_LENGTH = 300

// Plain text preview of the (HTML) content
const excerpt = (html = '') => {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  return text.length > EXCERPT_LENGTH ? `${text.slice(0, EXCERPT_LENGTH)}…` : text
}

const Moderation = () => {
  const [pending, setPending] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState<ParamsMsgBox>({ body: '', classname: '' })
  // Experience whose rejection form is open, and the reason being written
  const [rejecting, setRejecting] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const refreshPendingCount = useModerationStore((state) => state.refreshPendingCount)

  const loadPending = useCallback(async () => {
    setLoading(true)
    try {
      setPending(await listAllExperiences({ scope: 'all', status: 'pending' }))
    } catch (error) {
      setMessage({ body: getErrorMessage(error, 'Could not load pending experiences'), classname: 'msg_error' })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadPending()
  }, [loadPending])

  const decide = async (experience: Experience, status: 'published' | 'rejected') => {
    try {
      await reviewExperience(experience._id, status, status === 'rejected' ? reason.trim() : '')
      setPending((list) => list.filter((item) => item._id !== experience._id))
      setRejecting(null)
      setReason('')
      refreshPendingCount()
      setMessage({
        body: status === 'published' ? `"${experience.title}" published` : `"${experience.title}" rejected`,
        classname: 'msg_ok',
      })
    } catch (error) {
      setMessage({ body: getErrorMessage(error, 'Could not save the decision'), classname: 'msg_error' })
    }
  }

  return <div className="content moderation">
    <div className="content_top">
      <h2 className="content_top_title">Moderation</h2>
      <p className="content_top_subtitle">Experiences sent by users wait here until you publish or reject them.</p>
    </div>

    {loading && <Spinner />}
    {!loading && pending.length === 0 && <p className="no_results">Nothing to review 🎉</p>}

    <ul className="moderation_list">
      {pending.map((experience) => {
        const cover = experience.images?.[0] || experience.image
        const city = typeof experience.city === 'object' ? experience.city : undefined
        return <li key={experience._id} className="moderation_item">
          {cover && <img className="moderation_image" src={`${URL}/static/images/${cover}`} alt="" />}

          <div className="moderation_body">
            <h3 className="moderation_title">
              <NavLink to={`/experience/${experience._id}`} target="_blank">{experience.title}</NavLink>
            </h3>
            <p className="moderation_meta">
              by <strong>{experience.user || 'unknown'}</strong> · <FormattedDate date={experience.date} />
              {experience.category && <> · {experience.category}</>}
              {city && <> · {city.name}, {city.country}</>}
            </p>
            <p className="moderation_excerpt">{excerpt(experience.content)}</p>

            {rejecting === experience._id ? (
              <div className="moderation_reject">
                <label htmlFor={`reason-${experience._id}`}>Reason (shown to the author, optional)</label>
                <textarea
                  id={`reason-${experience._id}`}
                  className="form_control"
                  value={reason}
                  maxLength={500}
                  onChange={(e) => setReason(e.target.value)}
                />
                <div className="moderation_actions">
                  <button type="button" className="btn btn_admin btn_danger" onClick={() => decide(experience, 'rejected')}>Confirm rejection</button>
                  <button type="button" className="btn_link" onClick={() => { setRejecting(null); setReason('') }}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="moderation_actions">
                <button type="button" className="btn btn_admin" onClick={() => decide(experience, 'published')}>
                  <MdCheckCircle /> Publish
                </button>
                <button type="button" className="btn btn_admin btn_danger" onClick={() => { setRejecting(experience._id); setReason('') }}>
                  <MdCancel /> Reject
                </button>
              </div>
            )}
          </div>
        </li>
      })}
    </ul>

    <Msgbox {...message} />
  </div>
}

export default Moderation
