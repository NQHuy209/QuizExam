package com.example.quizexam_student.service.impl;

import com.example.quizexam_student.bean.request.StudentRequest;
import com.example.quizexam_student.bean.request.UserRequest;
import com.example.quizexam_student.bean.response.StudentResponse;
import com.example.quizexam_student.bean.response.UserResponse;
import com.example.quizexam_student.entity.*;
import com.example.quizexam_student.exception.AlreadyExistException;
import com.example.quizexam_student.exception.EmptyException;
import com.example.quizexam_student.exception.NotFoundException;
import com.example.quizexam_student.mapper.StudentMapper;
import com.example.quizexam_student.mapper.UserMapper;
import com.example.quizexam_student.repository.*;
import com.example.quizexam_student.service.StudentService;
import com.example.quizexam_student.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentServiceImpl implements StudentService {
    private final UserRepository userRepository;

    private final RoleRepository roleRepository;

    private final StudentRepository studentRepository;

    private final StatusRepository statusRepository;

    private final ClassesRepository classesRepository;

    private final PasswordEncoder passwordEncoder;
    private final UserService userService;

    @Override
    public StudentDetail getStudentDetailByUser(User user) {
        return studentRepository.findStudentDetailByUser(user);
    }

    @Override
    public List<StudentResponse> getAllStudentsNoneClass() {
        Role role = roleRepository.findByName("STUDENT");
        List<UserResponse> userResponses = userRepository.findByRole(role).stream().map(UserMapper::convertToResponse).collect(Collectors.toList());
        List<StudentResponse> studentResponses = userResponses.stream().map(userResponse -> StudentMapper.convertToResponse(userResponse, studentRepository.findByUser(userRepository.findById(userResponse.getId()).orElse(null)))).collect(Collectors.toList());
        studentResponses.removeIf(std->std.get_class()!=null);
        return studentResponses;
    }

    @Override
    public List<StudentResponse> getAllStudentsByClass(int classId) {
        Role role = roleRepository.findByName("STUDENT");
        List<UserResponse> userResponses = userRepository.findByRole(role).stream().map(UserMapper::convertToResponse).collect(Collectors.toList());
        List<StudentResponse> studentResponses = userResponses.stream().map(userResponse -> StudentMapper.convertToResponse(userResponse, studentRepository.findByUser(userRepository.findById(userResponse.getId()).orElse(null)))).collect(Collectors.toList());
        studentResponses.removeIf(std->std.get_class()==null||std.get_class().getId()!=classId);
        return studentResponses;
    }

    @Override
    public StudentDetail addStudent(StudentRequest studentRequest) {
        if (studentRepository.existsByRollPortal(studentRequest.getRollPortal())) {
            throw new AlreadyExistException("rollPortal", "Roll Portal already exists.");
        }
        if (studentRepository.existsByRollNumber(studentRequest.getRollNumber())) {
            throw new AlreadyExistException("rollNumber", "Roll Number already exists.");
        }
        User user = userService.saveUser(studentRequest.getUserRequest());
        StudentDetail studentDetail = StudentMapper.convertFromRequest(studentRequest);
        Status status = statusRepository.findById(1).orElse(null);
        Classes classes = classesRepository.findById(studentRequest.getClassId()).orElse(null);
        studentDetail.setStatus(status);
        studentDetail.setUser(user);
        studentDetail.set_class(classes);
        return studentRepository.save(studentDetail);
    }

    @Override
    public StudentDetail updateStudent(StudentRequest studentRequest, int id) {
        User userUpdate = userRepository.findById(id).orElse(null);
        Role role = roleRepository.findById(5).orElse(null);
        StudentDetail studentUpdate = studentRepository.findById(id).orElse(null);

        if (Objects.isNull(userUpdate) || userUpdate.getStatus() == 0 || Objects.isNull(studentUpdate)) {
            throw new NotFoundException("student", "Student not found.");
        }
        UserRequest userRequest = studentRequest.getUserRequest();
        if (userRepository.existsByEmailAndIdNot(userRequest.getEmail(), id)) {
            throw new AlreadyExistException("email", "Email already exists.");
        }
        if (userRepository.existsByPhoneNumberAndIdNot(userRequest.getPhoneNumber(), id)) {
            throw new AlreadyExistException("phoneNumber", "Phone Number already exists.");
        }
        if (studentRepository.existsByRollPortalAndUserNot(studentRequest.getRollPortal(), userUpdate)) {
            throw new AlreadyExistException("rollPortal", "Roll Portal already exists.");
        }
        if (studentRepository.existsByRollNumberAndUserNot(studentRequest.getRollNumber(), userUpdate)) {
            throw new AlreadyExistException("rollNumber", "Roll Number already exists.");
        }

        // Cập nhật bảng user
        userUpdate = UserMapper.convertFromRequest(userRequest);
        userUpdate.setRole(role);
        userUpdate.setId(id);
        userUpdate.setPassword(passwordEncoder.encode("@1234567"));
        userUpdate.setStatus(1);
        userRepository.save(userUpdate);

        // Cập nhật bảng student_detail
        studentUpdate.setRollPortal(studentRequest.getRollPortal());
        studentUpdate.setRollNumber(studentRequest.getRollNumber());
        return studentRepository.save(studentUpdate);
    }

    @Override
    public void updateClassForStudents(List<Integer> userIds, int classId) {
        Classes newClass = classesRepository.findById(classId).orElse(null);
        if (Objects.isNull(newClass)) {
            throw new NotFoundException("class", "Class not found.");
        }
        List<StudentDetail> students = studentRepository.findAllByUserIdIn(userIds);
        Status status = statusRepository.findById(2).orElse(null);
        for (StudentDetail student : students) {
            student.set_class(newClass);
            student.setStatus(status);
        }
        studentRepository.saveAll(students);
    }

    public User addUser(UserRequest userRequest) {
        if (userRepository.existsByEmail(userRequest.getEmail())) {
            throw new AlreadyExistException("email", "Email already exists.");
        }
        if (userRepository.existsByPhoneNumber(userRequest.getPhoneNumber())) {
            throw new AlreadyExistException("phoneNumber", "Phone Number already exists.");
        }
        User user = new User();
        user.setEmail(userRequest.getEmail());
        user.setPassword(passwordEncoder.encode("@1234567"));
        user.setDob(userRequest.getDob());
        user.setGender(userRequest.getGender());
        user.setFullName(userRequest.getFullName());
        user.setAddress(userRequest.getAddress());
        user.setPhoneNumber(userRequest.getPhoneNumber());
        Role role = roleRepository.findById(5).orElse(null);
        user.setRole(role);
        user.setStatus(1);
        return userRepository.save(user);
    }

    public void setUser(User userUpdate, UserRequest userInput) {
        userUpdate.setEmail(userInput.getEmail());
        userUpdate.setDob(userInput.getDob());
        userUpdate.setGender(userInput.getGender());
        userUpdate.setFullName(userInput.getFullName());
        userUpdate.setAddress(userInput.getAddress());
        userUpdate.setPhoneNumber(userInput.getPhoneNumber());
    }
}
