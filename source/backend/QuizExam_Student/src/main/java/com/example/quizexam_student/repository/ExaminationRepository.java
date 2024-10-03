package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Integer> {

}
