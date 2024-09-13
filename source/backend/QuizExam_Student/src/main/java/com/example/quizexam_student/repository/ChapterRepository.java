package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, Integer> {
    Chapter findByName(String name);
    List<Chapter> findByStatus(int status);
}