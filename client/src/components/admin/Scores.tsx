import { useEffect, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { MdDelete } from 'react-icons/md'
import { deleteScore } from '@/api/scores'
import type { Score } from '@/api/types'
import { useScoresStore } from '@/store/scoresStore'
import { useSortedData } from '@/hooks/useSortedData'
import { useMessage } from '@/hooks/useMessage'
import Msgbox from '@/components/common/Msgbox'
import Spinner from '@/components/common/Spinner'
import Table, { Column } from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const COLUMNS: Column[] = [
  { key: 'experience', label: 'Experience', sortable: true, width: 'w40' },
  { key: 'user', label: 'User', sortable: true, width: 'w30' },
  { key: 'score', label: 'Score', sortable: true, width: 'w20', align: 'center' },
  { key: 'actions', label: 'Action', sortable: false, width: 'w10', align: 'center' },
]

const Scores = () => {
  const { items: scores, loading, error, fetch } = useScoresStore()
  const { message, showOk, showError } = useMessage()
  // Votes have no date: newest first by insertion order until a column is chosen
  const newestFirst = useMemo(() => [...scores].reverse(), [scores])
  const sort = useSortedData(newestFirst)

  useEffect(() => {
    fetch()
  }, [fetch])

  const onClickDelete = async (score: Score) => {
    try {
      await deleteScore(score._id)
      await fetch({ force: true })
      showOk('Score deleted!')
    } catch (error) {
      showError(error, 'Could not delete the score')
    }
  }

  const renderRow = (score: Score) => (
    <div className="tGroup" role="rowgroup" key={score._id}>
      <div className="tRow" role="row">
        <div className="tCol" role="cell">
          <NavLink to={`/experience/${score.experience}`} target="_blank">View experience</NavLink>
        </div>
        <div className="tCol" role="cell"><span>{score.user}</span></div>
        <div className="tCol center" role="cell"><span>{score.score}</span></div>
        <div className="tCol center" role="cell">
          <TableActions
            item={score}
            actions={[{ key: 'delete', icon: <MdDelete />, title: 'Delete', onClick: onClickDelete }]}
          />
        </div>
      </div>
    </div>
  )

  return <div className="content scores">
    <div className="content_top">
      <h2 className="content_top_title">Scores</h2>
    </div>

    {loading && <Spinner />}
    {error && <p className="msg error">{error}</p>}

    <Table label="Scores" columns={COLUMNS} data={sort.sorted} renderRow={renderRow} sort={sort} hasPagination itemsPerPage={5} />

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Scores
