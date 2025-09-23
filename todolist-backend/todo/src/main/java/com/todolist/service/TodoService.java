package com.todolist.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.todolist.dto.TodoRequest;
import com.todolist.entity.Todo;
import com.todolist.repository.TodoRepository;

@Service
@Transactional
public class TodoService {

    private final TodoRepository todoRepository;

    public TodoService(TodoRepository todoRepository) {
        this.todoRepository = todoRepository;
    }

    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    public Todo createTodo(TodoRequest request) {
        Todo todo = new Todo();
        todo.setTodoNm(request.getTodoNm());
        todo.setAchievement(false);
        if (request.getDueDate() != null) {
            todo.setDueDate(request.getDueDate());
        }
        // 새로 추가된/누락된 매핑
        todo.setDescription(request.getDescription());
        todo.setPriority(request.getPriority());
        return todoRepository.save(todo);
    }

    public Todo updateTodo(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Todo not found: " + id));
        todo.setTodoNm(request.getTodoNm());
        todo.setAchievement(request.isAchievement());
        if (request.getDueDate() != null) {
            todo.setDueDate(request.getDueDate());
        } else {
            todo.setDueDate(null);
        }
        // 수정 시에도 매핑 반영
        todo.setDescription(request.getDescription());
        todo.setPriority(request.getPriority());
        return todoRepository.save(todo);
    }

    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new IllegalArgumentException("Todo not found: " + id);
        }
        todoRepository.deleteById(id);
    }
}
