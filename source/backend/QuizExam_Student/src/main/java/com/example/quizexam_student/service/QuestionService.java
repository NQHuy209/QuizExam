package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.QuestionRequest;
import com.example.quizexam_student.bean.response.QuestionResponse;
import com.example.quizexam_student.entity.Question;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;

@Service
public interface QuestionService {
    List<QuestionResponse> getAllQuestionsBySubjectId(int subjectId);
    List<Question> saveQuestions(List<QuestionRequest> questionRequests) throws IOException;
    Question updateQuestion(int id, QuestionRequest questionRequest) throws IOException;
}
