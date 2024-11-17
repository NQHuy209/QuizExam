package com.example.quizexam_student.service;

import com.example.quizexam_student.bean.request.PasswordRequest;
import com.example.quizexam_student.bean.request.UserRequest;
import com.example.quizexam_student.bean.response.UserResponse;
import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface UserService {
    User findUserByEmail(String email);
    User findById(int id);
    Boolean existUserByEmail(String email);
    Boolean existUserByPhone(String phone);
    User saveUser(UserRequest userRequest);
    List<UserResponse> getUserByRolePermission(Role role, Integer status);
    User changePassword(PasswordRequest passwordRequest);
    void deleteUserById(int id);
    User updateUser(int id, UserRequest userRequest);
    User resetPassword(int id);
    void restoreUser(int id);
}
