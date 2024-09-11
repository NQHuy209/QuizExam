package com.example.quizexam_student.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class AlreadyExistException extends RuntimeException {
    private final String key;
    private final String message;
}