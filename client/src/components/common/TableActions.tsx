import type { ReactNode } from 'react'

type Action<T> = {
  key: string
  icon: ReactNode
  title: string
  onClick: (item: T) => void
  show?: (item: T) => boolean
  className?: string
}

type TableActionsProps<T> = {
  actions: Action<T>[]
  item: T
}

const TableActions = <T,>({ actions, item }: TableActionsProps<T>) => {
  return (
    <div className="icons">
      {actions.filter(action => (action.show ? action.show(item) : true)).map(action => (
        <button
          key={action.key}
          type="button"
          className={action.className ?? 'btn_action'}
          title={action.title}
          onClick={() => action.onClick(item)}
        >
          {action.icon}
        </button>
      ))}
    </div>
  )
}

export default TableActions