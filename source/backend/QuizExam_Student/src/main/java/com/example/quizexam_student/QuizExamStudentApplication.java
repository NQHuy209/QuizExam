package com.example.quizexam_student;

import com.example.quizexam_student.entity.Classes;
import com.example.quizexam_student.entity.Examination;
import com.example.quizexam_student.repository.ClassesRepository;
import com.example.quizexam_student.repository.ExaminationRepository;
import com.example.quizexam_student.repository.MarkRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@SpringBootApplication
@RequiredArgsConstructor
@EnableScheduling
public class QuizExamStudentApplication {
    private final ExaminationRepository examinationRepository;

    private final MarkRepository markRepository;

    public static void main(String[] args) {
        SpringApplication.run(QuizExamStudentApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true);
            }
        };
    }
}