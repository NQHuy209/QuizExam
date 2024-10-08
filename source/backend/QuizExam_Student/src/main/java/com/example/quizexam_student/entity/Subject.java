package com.example.quizexam_student.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "t_subject")
@Data
@NoArgsConstructor
@Getter
@Setter
public class Subject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "subject_id")
    private int id;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "status", nullable = false)
    private int status;

    @Column(name = "image")
    @Lob
    private byte[] image;

    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "sem_id")
    private Sem sem;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "subject")
    private Set<Chapter> chapters;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "subject")
    private Set<Mark> marks;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "subject")
    private Set<Question> questions;
}
