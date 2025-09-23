package com.todolist.dto;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

/**
 * LocalDateTime용 유연한 역직렬화기.
 * - 날짜만 들어오면 자정(00:00:00)으로 보정
 * - 공백 또는 'T' 구분자 허용
 * - 초/밀리초/오프셋(Z, +09:00 등) 허용
 */
public class FlexibleLocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final List<DateTimeFormatter> LOCAL_DATE_TIME_FORMATTERS = List.of(
            DateTimeFormatter.ISO_LOCAL_DATE_TIME,                       // 2025-08-31T23:59:00[.SSS]
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"),            // 2025-08-31 23:59
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"),         // 2025-08-31 23:59:00
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")      // 2025-08-31 23:59:00.123
    );

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String text = p.getText();
        if (text == null || text.isBlank()) {
            return null;
        }
        String value = text.trim();

        // 1) 오프셋 포함 형태 먼저 시도 (Z, +09:00 등)
        try {
            OffsetDateTime odt = OffsetDateTime.parse(value, DateTimeFormatter.ISO_OFFSET_DATE_TIME);
            return odt.toLocalDateTime();
        } catch (DateTimeParseException ignored) {
        }

        // 2) 'T' -> 공백 치환해서 일반 포맷 시도
        String normalized = value.replace('T', ' ');
        for (DateTimeFormatter f : LOCAL_DATE_TIME_FORMATTERS) {
            try {
                return LocalDateTime.parse(normalized, f);
            } catch (DateTimeParseException ignored) {
            }
        }

        // 3) 날짜만 들어온 경우
        try {
            LocalDate d = LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE);
            return d.atStartOfDay();
        } catch (DateTimeParseException ignored) {
        }

        // 4) 마지막으로 ISO 기본 포맷 재시도 (원문)
        try {
            return LocalDateTime.parse(value, DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            throw ctxt.weirdStringException(value, LocalDateTime.class, "지원되지 않는 날짜/시간 형식입니다.");
        }
    }
}


