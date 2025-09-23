import PropTypes from 'prop-types';
import {
  FiCheckCircle,
  FiCircle,
  FiClock,
  FiEdit2,
  FiFlag,
  FiTrash2
} from 'react-icons/fi';
import { format, isPast, isToday, parseISO } from 'date-fns';

const priorityLabels = ['여유', '낮음', '보통', '중간', '높음', '최우선'];

const getPriorityLabel = (priority) => priorityLabels[Math.min(Math.max(priority, 0), 5)];

const resolveDueInfo = (dueDate, achievement) => {
  if (!dueDate) {
    return { label: '기한 없음', tone: 'neutral' };
  }
  try {
    const parsed = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
    if (achievement) {
      return { label: `${format(parsed, 'M월 d일 HH:mm')} 마감`, tone: 'neutral' };
    }
    if (isPast(parsed) && !isToday(parsed)) {
      return { label: `${format(parsed, 'M월 d일 HH:mm')} 마감`, tone: 'danger' };
    }
    if (isToday(parsed)) {
      return { label: '오늘 마감', tone: 'warning' };
    }
    return { label: `${format(parsed, 'M월 d일 HH:mm')} 마감`, tone: 'accent' };
  } catch (error) {
    return { label: '날짜 형식 오류', tone: 'danger' };
  }
};

function TodoCard({ todo, onEdit, onDelete, onToggle }) {
  const due = resolveDueInfo(todo.dueDate, todo.achievement);
  const priority = Math.min(Math.max(todo.priority ?? 0, 0), 5);

  return (
    <article
      className={`todo-card ${todo.achievement ? 'is-complete' : ''} ${due.tone}`}
      aria-checked={todo.achievement}
      role="listitem"
    >
      <div className="todo-card__header">
        <button
          type="button"
          className="toggle-status"
          onClick={onToggle}
          aria-label={todo.achievement ? '할 일 되돌리기' : '할 일 완료하기'}
        >
          {todo.achievement ? <FiCheckCircle /> : <FiCircle />}
        </button>
        <div className="todo-card__titles">
          <h3>{todo.todoNm}</h3>
          {todo.description ? <p>{todo.description}</p> : null}
        </div>
        <div className="todo-card__actions">
          <button type="button" onClick={onEdit} aria-label="할 일 수정">
            <FiEdit2 />
          </button>
          <button type="button" onClick={onDelete} aria-label="할 일 삭제">
            <FiTrash2 />
          </button>
        </div>
      </div>

      <div className="todo-card__meta">
        <span className={`meta-chip ${due.tone}`}>
          <FiClock /> {due.label}
        </span>
        <span className={`meta-chip priority-${priority}`}>
          <FiFlag /> {getPriorityLabel(priority)}
        </span>
        <span className={`meta-chip status ${todo.achievement ? 'done' : 'progress'}`}>
          {todo.achievement ? '완료됨' : '진행중'}
        </span>
      </div>
    </article>
  );
}

TodoCard.propTypes = {
  todo: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    todoNm: PropTypes.string,
    description: PropTypes.string,
    dueDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    priority: PropTypes.number,
    achievement: PropTypes.bool
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired
};

export default TodoCard;
