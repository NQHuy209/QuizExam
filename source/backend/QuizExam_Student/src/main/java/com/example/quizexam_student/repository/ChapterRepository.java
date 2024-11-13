package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    Chapter findByNameAndStatus(String name, int status);
    List<Chapter> findAllByStatusAndSubjectId(int status, int subjectId);
    List<Chapter> findByIdIn(List<Integer> ids);
    Chapter findByIdAndStatus(int id, int status);
}
