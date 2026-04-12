import { useState, useEffect, useMemo } from 'react'
import { postData } from '@utils/utils'
import { sortBy } from 'lodash'
import { MdDelete } from 'react-icons/md'
import { useScoresStore } from '@store/scoresStore'
import { URL } from '../../config'
import Msgbox from '@common/Msgbox'
import Table from '@/components/common/Table'
import TableActions from '@/components/common/TableActions'

const Scores = () => {
  // fetch scores
  const { scores, loading, error, fetchScores } = useScoresStore()
  const [message, setMessage] = useState({ body: '', classname: '' })

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  const onClickDelete = async (id: string) => {
    try {
      let url = `${URL}/admin/scores/delete`
      await postData(url, { _id: id })
      fetchScores()
      setMessage({ body: `Score deleted!`, classname: 'msg_ok' })
    } catch (error) {
      console.log(error)
    }
  }

  const [sortColumn, setSortColumn] = useState<string | null>('experience')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const itemsPerPage = 10

  const handleSort = (key: string) => {
    if (sortColumn === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(key)
      setSortDirection('asc')
    }
  }

  const sortedScores = useMemo(() => {
    if (!sortColumn) return sortBy(scores, ['date']).reverse()
    return [...scores].sort((a, b) => {
      const aVal = (a as any)[sortColumn]
      const bVal = (b as any)[sortColumn]
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [scores, sortColumn, sortDirection])

  const columns = [
    { key: 'experience', label: 'Experience', sortable: true, width: 'w40' },
    { key: 'user', label: 'User', sortable: true, width: 'w30' },
    { key: 'score', label: 'Score', sortable: true, width: 'w20', align: 'center' },
    { key: 'actions', label: 'Action', sortable: false, width: 'w10', align: 'center' }
  ]

  const renderRow = (ele: any) => {
    const actions = [
      {
        key: 'delete',
        icon: <MdDelete />,
        title: 'Delete',
        onClick: () => onClickDelete(ele._id),
      },
    ]

    return (
      <div className="tGroup" key={ele._id}>
        <div className="tRow">
          <div className="tCol">
            <span>{ele.experience}</span>
          </div>
          <div className="tCol">
            <span>{ele.user}</span>
          </div>
          <div className="tCol center">
            <span>{ele.score}</span>
          </div>
          <div className="tCol center">
            <TableActions actions={actions} item={ele} />
          </div>
        </div>
      </div>
    )
  }

  return <div className="content scores">
    <div className="content_top">
      <h2 className="content_top_title">Scores</h2>
    </div>

    {loading && <div>Loading...</div>}
    {error && <div>Error: {error}</div>}

    <Table
      columns={columns}
      data={sortedScores}
      renderRow={renderRow}
      onSort={handleSort}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      hasPagination={true}
      itemsPerPage={itemsPerPage}
    />

    <Msgbox body={message.body} classname={message.classname} />
  </div>
}

export default Scores
