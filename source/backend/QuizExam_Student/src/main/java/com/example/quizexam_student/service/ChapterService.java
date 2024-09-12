package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.ChapterRequest;
import com.example.quizexam_student.entity.Chapter;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface ChapterService {
    List<Chapter> getAllChapters();
    Chapter addChapter(ChapterRequest chapterRequest);
    Chapter getChapterById(int id);
    Chapter updateChapter(int id, ChapterRequest chapterRequest);
    void deleteChapter(int id);
}
