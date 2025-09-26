import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { FiCheckCircle, FiPlus, FiRefreshCw, FiSearch } from 'react-icons/fi';
import { format, isBefore, isToday, isTomorrow, parseISO } from 'date-fns';
import TodoCard from './components/TodoCard';
import { DEFAULT_PRIORITY, PRIORITY_SCALE, normalizePriority } from './utils/priority';
import './App.css';

const rawApiBase =
  process.env.REACT_APP_TODO_API || 'http://localhost:8081/api/todos';
const API_BASE = rawApiBase.replace(/\/$/, '');

const blankForm = {
  todoNm: '',
  description: '',
  dueDate: '',
  priority: DEFAULT_PRIORITY,
  achievement: false
};

const formatForInput = (value) => {
  if (!value) return '';
  try {
    const parsed = typeof value === 'string' ? parseISO(value) : value;
    return format(parsed, "yyyy-MM-dd'T'HH:mm");
  } catch (error) {
    return '';
  }
};

function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(blankForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(API_BASE);
      const normalized = Array.isArray(data)
        ? data.map((item) => ({ ...item, priority: normalizePriority(item.priority) }))
        : [];
      setTodos(normalized);
    } catch (err) {
      console.error(err);
      setError('할 일 목록을 불러오지 못했어요. 서버 상태를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const resetForm = () => {
    setForm(blankForm);
    setEditingId(null);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === 'priority' ? normalizePriority(value) : value
    }));
  };

  const serialize = (base, overrides = {}) => ({
    todoNm: overrides.todoNm ?? base.todoNm ?? '',
    description: overrides.description ?? base.description ?? '',
    priority: normalizePriority(overrides.priority ?? base.priority ?? DEFAULT_PRIORITY),
    dueDate: overrides.dueDate ?? base.dueDate ?? null,
    achievement: overrides.achievement ?? base.achievement ?? false
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.todoNm.trim()) {
      setError('할 일 제목을 입력해주세요.');
      return;
    }

    const payload = {
      todoNm: form.todoNm.trim(),
      description: form.description.trim(),
      priority: normalizePriority(form.priority),
      achievement: form.achievement,
      dueDate: form.dueDate ? `${form.dueDate}:00` : null
    };

    setSubmitting(true);
    setError('');
    try {
      if (editingId) {
        const { data } = await axios.put(`${API_BASE}/${editingId}`, payload);
        setTodos((prev) => prev.map((todo) => (todo.id === editingId ? data : todo)));
      } else {
        const { data } = await axios.post(API_BASE, payload);
        setTodos((prev) => [data, ...prev]);
      }
      resetForm();
    } catch (err) {
      console.error(err);
      setError('변경 사항을 저장하는 데 실패했어요. 입력 값을 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (todo) => {
    setEditingId(todo.id);
    setForm({
      todoNm: todo.todoNm ?? '',
      description: todo.description ?? '',
      priority: normalizePriority(todo.priority),
      dueDate: formatForInput(todo.dueDate),
      achievement: Boolean(todo.achievement)
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 할 일을 삭제할까요?')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError('삭제하는 동안 문제가 발생했습니다.');
    }
  };

  const toggleAchievement = async (todo) => {
    const nextAchievement = !todo.achievement;
    const payload = serialize(todo, {
      achievement: nextAchievement
    });
    try {
      const { data } = await axios.put(`${API_BASE}/${todo.id}`, payload);
      setTodos((prev) => prev.map((item) => (item.id === todo.id ? data : item)));
    } catch (err) {
      console.error(err);
      setError('완료 상태를 업데이트하지 못했습니다.');
    }
  };

  const filteredTodos = useMemo(() => {
    let base = [...todos];
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      base = base.filter((todo) =>
        [todo.todoNm, todo.description]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(keyword))
      );
    }
    if (filter === 'active') {
      base = base.filter((todo) => !todo.achievement);
    }
    if (filter === 'completed') {
      base = base.filter((todo) => todo.achievement);
    }
    return base.sort((a, b) => {
      if (a.achievement !== b.achievement) {
        return a.achievement ? 1 : -1;
      }
      const aPriority = normalizePriority(a.priority);
      const bPriority = normalizePriority(b.priority);
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }
      const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return aDue - bDue;
    });
  }, [todos, filter, search]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.achievement).length;
    const upcoming = todos.filter((todo) => {
      if (!todo.dueDate || todo.achievement) return false;
      try {
        const due = new Date(todo.dueDate);
        return isToday(due) || isTomorrow(due) || isBefore(due, new Date(Date.now() + 72 * 3600 * 1000));
      } catch (error) {
        return false;
      }
    }).length;
    return { total, completed, upcoming };
  }, [todos]);

  return (
    <div className="app-shell">
      <div className="galaxy-gradient" aria-hidden="true" />
      <header className="app-header">
        <div>
          <p className="eyebrow">Galaxy Todo Studio</p>
          <h1>
            오늘의 미션을 <span>완벽하게</span> 완수해보세요
          </h1>
          <p className="subtitle">
            일정, 우선순위, 설명까지 한 번에 정리하고 감각적인 인터페이스로 집중력을 높여보세요.
          </p>
        </div>
        <div className="stat-board">
          <div className="stat-card">
            <span className="label">전체</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span className="label">완료</span>
            <strong>{stats.completed}</strong>
          </div>
          <div className="stat-card">
            <span className="label">임박</span>
            <strong>{stats.upcoming}</strong>
          </div>
        </div>
      </header>

      <main className="app-layout">
        <section className="form-panel">
          <div className="panel-heading">
            <h2>{editingId ? '할 일 수정' : '새로운 할 일'}</h2>
            {editingId ? (
              <button className="ghost-button" type="button" onClick={resetForm}>
                <FiRefreshCw /> 새로 작성
              </button>
            ) : null}
          </div>

          <form className="todo-form" onSubmit={handleSubmit}>
            <div className="field-group">
              <label htmlFor="todoNm">할 일 제목</label>
              <input
                id="todoNm"
                name="todoNm"
                placeholder="무엇을 해야 하나요?"
                value={form.todoNm}
                onChange={handleInputChange}
              />
            </div>
            <div className="field-group">
              <label htmlFor="description">상세 설명</label>
              <textarea
                id="description"
                name="description"
                placeholder="기억해야 할 포인트나 메모를 남겨보세요."
                rows={4}
                value={form.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-grid">
              <div className="field-group">
                <label htmlFor="dueDate">마감일</label>
                <input
                  id="dueDate"
                  type="datetime-local"
                  name="dueDate"
                  value={form.dueDate}
                  onChange={handleInputChange}
                  list="dateOptions"
                  onFocus={(e) => {
                    // 일부 브라우저는 focus 시 자동으로 피커를 열지 않으므로, 가능한 경우 showPicker 사용
                    try {
                      if (typeof e.target.showPicker === 'function') {
                        e.target.showPicker();
                      }
                    } catch {}
                  }}
                />
                <datalist id="dateOptions">
                  <option value={format(new Date(Date.now() + 24 * 3600 * 1000), "yyyy-MM-dd'T'HH:mm")} label="내일" />
                  <option value={format(new Date(Date.now() + 7 * 24 * 3600 * 1000), "yyyy-MM-dd'T'HH:mm")} label="일주일 후" />
                  <option value={format(new Date(Date.now() + 30 * 24 * 3600 * 1000), "yyyy-MM-dd'T'HH:mm")} label="한 달 후" />
                </datalist>
              </div>
              <div className="field-group">
                <label htmlFor="priority">우선순위</label>
                <select
                  id="priority"
                  name="priority"
                  value={String(form.priority)}
                  onChange={handleInputChange}
                >
                  {PRIORITY_SCALE.map((option) => (
                    <option key={option.value} value={String(option.value)}>
                      {option.value} - {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {editingId ? (
              <label className="checkbox">
                <input
                  type="checkbox"
                  name="achievement"
                  checked={form.achievement}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, achievement: event.target.checked }))
                  }
                />
                완료 표시
              </label>
            ) : null}

            <button className="accent-button" type="submit" disabled={submitting}>
              <FiPlus /> {editingId ? '업데이트' : '할 일 추가'}
            </button>
          </form>

          {error ? <p className="error-text">{error}</p> : null}
        </section>

        <section className="list-panel">
          <div className="panel-heading">
            <h2>나의 할 일</h2>
            <div className="filter-group" role="tablist" aria-label="할 일 필터">
              <button
                type="button"
                className={filter === 'all' ? 'chip active' : 'chip'}
                onClick={() => setFilter('all')}
              >
                전체
              </button>
              <button
                type="button"
                className={filter === 'active' ? 'chip active' : 'chip'}
                onClick={() => setFilter('active')}
              >
                진행중
              </button>
              <button
                type="button"
                className={filter === 'completed' ? 'chip active' : 'chip'}
                onClick={() => setFilter('completed')}
              >
                완료
              </button>
            </div>
          </div>

          <div className="meta-actions">
            <button className="ghost-button" type="button" onClick={fetchTodos}>
              <FiRefreshCw /> 새로고침
            </button>
            <div className="search-bar">
              <FiSearch />
              <input
                type="search"
                placeholder="할 일을 검색해보세요"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="empty-state">로딩 중...</div>
          ) : filteredTodos.length === 0 ? (
            <div className="empty-state">
              <FiCheckCircle size={32} />
              <p>등록된 할 일이 없어요. 새로운 미션을 추가해볼까요?</p>
            </div>
          ) : (
            <div className="todo-grid">
              {filteredTodos.map((todo) => (
                <TodoCard
                  key={todo.id}
                  todo={todo}
                  onEdit={() => handleEdit(todo)}
                  onDelete={() => handleDelete(todo.id)}
                  onToggle={() => toggleAchievement(todo)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
