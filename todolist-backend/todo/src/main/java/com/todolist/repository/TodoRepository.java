package com.todolist.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.todolist.entity.Todo;

public interface TodoRepository extends JpaRepository<Todo, Long> {
    // 필요하면 커스텀 쿼리 추가 가능
}
