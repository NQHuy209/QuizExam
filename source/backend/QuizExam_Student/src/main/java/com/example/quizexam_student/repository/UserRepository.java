package com.example.quizexam_student.repository;

import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByEmailAndStatus(String email, Integer status);

    List<User> findByRoleAndStatus(Role role, Integer status);

    Optional<User> findByEmail(String email);

    Optional<User> findByPhoneNumber(String phoneNumber);

    Optional<User> findByEmailAndIdNot(String email, Integer id);

    Optional<User> findByPhoneNumberAndIdNot(String phoneNumber, Integer id);

    boolean existsByEmailAndIdNot(String email, Integer id); // Kiểm tra email đã tồn tại hay chưa, ngoại trừ chính nó (update)

    boolean existsByPhoneNumberAndIdNot(String phoneNumber, Integer id); // Kiểm tra phone number đã tồn tại hay chưa, ngoại trừ chính nó (update)

    User findByIdAndStatus(Integer id, Integer status);

    User findByIdAndStatusAndRole(Integer id, Integer status, Role role);
}