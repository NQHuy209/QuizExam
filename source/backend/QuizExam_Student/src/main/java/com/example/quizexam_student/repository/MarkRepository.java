package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Integer> {
    List<Mark> findAllByExaminationIdAndScore(int examinationId, Integer score);
}
