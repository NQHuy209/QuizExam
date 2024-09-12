package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.StudentRequest;
import com.example.quizexam_student.bean.request.UserRequest;
import com.example.quizexam_student.bean.response.StudentResponse;
import com.example.quizexam_student.entity.StudentDetail;
import com.example.quizexam_student.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface StudentService {
    public StudentDetail getStudentDetailByUser(User user);

    public List<StudentResponse> getAllStudentsNoneClass();

    public List<StudentResponse> getAllStudentsByClass(int classId);

    public StudentDetail addStudent(StudentRequest studentRequest);

    public StudentDetail updateStudent(StudentRequest studentRequest, int id);

    public void updateClassForStudents(List<Integer> userIds, int classId);
}
