package com.example.quizexam_student.bean.request;

import lombok.Data;

import java.util.List;

@Data
public class StudentQuestionAnswer {
    private Integer questionRecordId;

    private List<Integer> selectedAnswerIds;
}