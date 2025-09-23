package com.todolist.dto;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.LocalDateTime;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

class TodoRequestDeserializationTest {

    private final ObjectMapper objectMapper;

    TodoRequestDeserializationTest() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Test
    void deserializesIsoLocalDateTime() throws Exception {
        String json = "{\"todoNm\":\"Buy groceries\",\"dueDate\":\"2025-08-31T23:59:00\"}";

        TodoRequest request = objectMapper.readValue(json, TodoRequest.class);

        assertThat(request.getDueDate()).isEqualTo(LocalDateTime.of(2025, 8, 31, 23, 59));
    }

    @Test
    void deserializesWithSpaceSeparatorAndSeconds() throws Exception {
        String json = "{\"todoNm\":\"Morning workout\",\"dueDate\":\"2025-08-31 06:30:15\"}";

        TodoRequest request = objectMapper.readValue(json, TodoRequest.class);

        assertThat(request.getDueDate()).isEqualTo(LocalDateTime.of(2025, 8, 31, 6, 30, 15));
    }

    @Test
    void deserializesDateOnlyAsStartOfDay() throws Exception {
        String json = "{\"todoNm\":\"Submit report\",\"dueDate\":\"2025-08-31\"}";

        TodoRequest request = objectMapper.readValue(json, TodoRequest.class);

        assertThat(request.getDueDate()).isEqualTo(LocalDateTime.of(2025, 8, 31, 0, 0));
    }

    @Test
    void deserializesWithOffset() throws Exception {
        String json = "{\"todoNm\":\"Call partner\",\"dueDate\":\"2025-08-31T09:30:00+09:00\"}";

        TodoRequest request = objectMapper.readValue(json, TodoRequest.class);

        assertThat(request.getDueDate()).isEqualTo(LocalDateTime.of(2025, 8, 31, 9, 30));
    }

    @Test
    void returnsNullWhenDueDateIsBlank() throws Exception {
        String json = "{\"todoNm\":\"Plan vacation\",\"dueDate\":\"   \"}";

        TodoRequest request = objectMapper.readValue(json, TodoRequest.class);

        assertThat(request.getDueDate()).isNull();
    }
}
