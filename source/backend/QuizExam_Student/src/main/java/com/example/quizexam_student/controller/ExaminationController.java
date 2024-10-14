package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.ExaminationRequest;
import com.example.quizexam_student.bean.response.ExaminationResponse;
import com.example.quizexam_student.bean.response.QuestionResponse;
import com.example.quizexam_student.entity.Answer;
import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.service.ClassesService;
import com.example.quizexam_student.service.ExaminationService;
import com.example.quizexam_student.service.QuestionService;
import com.example.quizexam_student.service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/exam")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Validated
@PreAuthorize("permitAll()")
public class ExaminationController {

    private final ExaminationService examinationService;
    private final ClassesService classesService;
    private final StudentService studentService;

    @GetMapping("/{examinationId}")
    public ExaminationResponse getDetailExamination(@PathVariable int examinationId) {
        return examinationService.getDetailExamination(examinationId);
    }

    @GetMapping("")
    public List<ExaminationResponse> getAllExamination() {
        return examinationService.getAllExaminations();
    }

    @PostMapping("")
    public Examination save(@RequestBody ExaminationRequest examinationRequest) {
        return examinationService.saveExamination(examinationRequest);
    }

    @PutMapping("/{examinationId}")
    public Examination update(@PathVariable int examinationId, @RequestBody ExaminationRequest examinationRequest) {
        return examinationService.updateExamination(examinationId, examinationRequest);
    }

    @PutMapping("/student/{examinationId}/{subjectId}")
    public ResponseEntity<String> updateStudentForExam(
            @PathVariable int examinationId,
            @PathVariable int subjectId,
            @RequestBody List<Integer> studentIds){
        examinationService.updateStudentForExam(examinationId, subjectId, studentIds);
        return ResponseEntity.ok("Update Student Success");
    }
}
