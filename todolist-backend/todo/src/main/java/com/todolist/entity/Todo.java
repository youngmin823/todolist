package com.todolist.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity // JPA가 클래스를 DB에서 관리할 수 있게함.
@Table(name = "todolist") // 사용할 테이블 설정
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder //빌더 패턴 구현을 자동 생성해줌.
public class Todo {

    @Id //해당 필드가 테이블의 Primary Key(기본 키)임을 나타냄.
    @GeneratedValue(strategy = GenerationType.IDENTITY) // PK값을 어떻게 생성할 지 JPA에게 맡김.
    private Long id; // PK

    @Column(nullable = false) // 테이블의 칼럼 이름 / 길이 / nullable 여부 지정
    private String todoNm; // 할 일 제목

    private boolean achievement; // 완료 여부

    private LocalDateTime dueDate; // 마감일

    private int priority; // 우선순위

    private String description; // 설명

    private LocalDateTime registeredAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (registeredAt == null) {
            registeredAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = registeredAt;
        }
        // null 방지 기본값
        if (todoNm == null) {
            todoNm = "";
        }
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
