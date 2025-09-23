package com.todolist.dto;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter //해당 클래스 또는 필드의 getter 메서드 자동 생성
@Setter //해당 클래스 또는 필드의 setter 메서드 자동 생성
@NoArgsConstructor //파라미터가 없는 기본 생성자를 자동으로 만들어줌. 
@AllArgsConstructor //클래스의 모든 필드를 인자로 하는 생성자를 자동으로 만들어줌.
@JsonIgnoreProperties(ignoreUnknown = true)
public class TodoRequest {
    @NotBlank
    @JsonAlias({"todoName", "todo", "title", "name"})
    private String todoNm;
    private boolean achievement;
    // ISO-8601: 'T' 또는 공백 허용, 초/밀리초/시간대 옵셔널
    // 예) 2025-08-18T10:30, 2025-08-18 10:30:00.123, 2025-08-18T10:30:00+09:00
    @JsonAlias({"dueDate", "deadline", "due", "dueAt", "due_at", "due_date"})
    // 날짜만 들어와도(yyyy-MM-dd) 허용, 시간/초/밀리초/오프셋(Z, +09:00 등) 모두 선택 입력 허용
    @JsonFormat(pattern = "yyyy-MM-dd[['T'][' ']HH:mm[:ss][.SSS][XXX][X][XX]]")
    @JsonDeserialize(using = FlexibleLocalDateTimeDeserializer.class)
    private LocalDateTime dueDate;
    private int priority;
    private String description;
}
