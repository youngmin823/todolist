package com.todolist.service;

import com.todolist.dto.TodoRequest;
import com.todolist.entity.Todo;
import com.todolist.repository.TodoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

import static org.springframework.http.HttpStatus.NOT_FOUND;

@Service
@RequiredArgsConstructor
public class TodoService {

    private final TodoRepository todoRepository;

    @Transactional(readOnly = true)
    public List<Todo> getAllTodos() {
        return todoRepository.findAll();
    }

    @Transactional
    public Todo createTodo(TodoRequest request) {
        Todo todo = new Todo();
        todo.setTodoNm(request.getTodoNm());
        todo.setAchievement(request.isAchievement());
        todo.setDueDate(request.getDueDate());
        todo.setPriority(request.getPriority());
        todo.setDescription(request.getDescription());
        return todoRepository.save(todo);
    }

    @Transactional
    public Todo updateTodo(Long id, TodoRequest request) {
        Todo todo = todoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(NOT_FOUND, "Todo not found with id=" + id));

        todo.setTodoNm(request.getTodoNm());
        todo.setAchievement(request.isAchievement());
        todo.setDueDate(request.getDueDate());
        todo.setPriority(request.getPriority());
        todo.setDescription(request.getDescription());
        return todo;
    }

    @Transactional
    public void deleteTodo(Long id) {
        if (!todoRepository.existsById(id)) {
            throw new ResponseStatusException(NOT_FOUND, "Todo not found with id=" + id);
        }
        todoRepository.deleteById(id);
    }
}
