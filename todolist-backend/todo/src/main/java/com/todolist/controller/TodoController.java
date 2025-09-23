package com.todolist.controller;

import com.todolist.dto.TodoRequest;
import com.todolist.entity.Todo;
import com.todolist.service.TodoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
@RequestMapping({"/api/todos", "/todos"})
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    // 1. 전체 조회
    @GetMapping
    public ResponseEntity<List<Todo>> getAllTodos() {
        List<Todo> todos = todoService.getAllTodos();
        return ResponseEntity.ok(todos); // 200 OK
    }

    // 2. 생성
    @PostMapping
    public ResponseEntity<Todo> createTodo(@RequestBody @jakarta.validation.Valid TodoRequest request) {
        if (request.getTodoNm() == null || request.getTodoNm().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Todo savedTodo = todoService.createTodo(request);
        return ResponseEntity
                .created(URI.create("/api/todos/" + savedTodo.getId())) // 201 Created + Location 헤더
                .body(savedTodo);
    }

    // 3. 수정
    @PutMapping("/{id}")
    public ResponseEntity<Todo> updateTodo(@PathVariable Long id, @RequestBody TodoRequest request) {
        Todo updatedTodo = todoService.updateTodo(id, request);
        return ResponseEntity.ok(updatedTodo); // 200 OK
    }

    // 4. 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}
