package com.example.quizexam_student.controller;

import com.example.quizexam_student.bean.request.UserRequest;
import com.example.quizexam_student.bean.response.EmpExcelExporter;
import com.example.quizexam_student.bean.response.EmpPDFExporter;
import com.example.quizexam_student.bean.response.RegisterResponse;
import com.example.quizexam_student.bean.response.UserResponse;
import com.example.quizexam_student.entity.Role;
import com.example.quizexam_student.entity.User;
import com.example.quizexam_student.exception.EmptyException;
import com.example.quizexam_student.mapper.UserMapper;
import com.example.quizexam_student.repository.RoleRepository;
import com.example.quizexam_student.service.ExportService;
import com.example.quizexam_student.service.RoleService;
import com.example.quizexam_student.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
@Validated
public class UserController {
    private final UserService userService;
    private final RoleService roleService;
    private final ExportService exportService;
    private final RoleRepository roleRepository;

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO', 'DIRECTOR', 'TEACHER')")
    @GetMapping("/{status}")
    public List<UserResponse> getAll(@PathVariable Integer status){
        String email = ((org.springframework.security.core.userdetails.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Role role = userService.findUserByEmail(email).getRole();
        System.out.println(role);
        List<Role> roles = roleService.findAllByPermissionToEmployee(role.getId());
        if(roles!=null){
            List<UserResponse> users = new ArrayList<>();
            roles.forEach(role1 -> {
                users.addAll(userService.getUserByRolePermission(role1, status));
            });
            return users;
        }
        return null;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'SRO', 'DIRECTOR', 'TEACHER')")
    @GetMapping("/dashboard/{status}")
    public List<UserResponse> getAllEmployee(@PathVariable Integer status){
        List<Role> roles = roleRepository.findAll();
        roles.removeIf(role -> role.getName().equals("STUDENT"));
        List<UserResponse> users = new ArrayList<>();
        roles.forEach(role1 -> {
            users.addAll(userService.getUserByRolePermission(role1, status));
        });
        return users;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @GetMapping("/find/{id}")
    public UserResponse getEmployeeById(@PathVariable Integer id) {
        return UserMapper.convertToResponse(userService.findById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @GetMapping("/employee")
    public List<Role> getRolePermissionToEmployees() {
        String email = ((org.springframework.security.core.userdetails.User) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUsername();
        Role role = userService.findUserByEmail(email).getRole();
        return roleService.findAllByPermissionToEmployee(role.getId());
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PostMapping("")
    public ResponseEntity<RegisterResponse> addEmployee(@RequestBody @Valid UserRequest userRequest) {
        userService.saveUser(userRequest);
        return ResponseEntity.ok(new RegisterResponse(userRequest.getEmail(), "Employee created successfully"));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PutMapping("/remove/{id}")
    public UserResponse remove(@PathVariable int id) {
        return UserMapper.convertToResponse(userService.deleteUserById(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR', 'SRO', 'TEACHER')")
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable int id, @RequestBody @Valid UserRequest userRequest) {
        return ResponseEntity.ok(userService.updateUser(id, userRequest));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PutMapping("/reset-password/{id}")
    public ResponseEntity<User> resetPassword(@PathVariable int id) {
        return ResponseEntity.ok(userService.resetPassword(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PutMapping("/restore/{id}")
    public ResponseEntity<User> restoreUser(@PathVariable int id){
        return ResponseEntity.ok(userService.restoreUser(id));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PostMapping("/export/excel")
    public ResponseEntity<String> exportToExcel(
            HttpServletResponse response,
            @RequestBody List<UserResponse> userResponseList)
            throws IOException {
        exportService.export(response, "user", "xlsx");
        EmpExcelExporter excelExporter = new EmpExcelExporter(userResponseList);
        excelExporter.export(response);
        return new ResponseEntity<>("Export To Excel Successfully", HttpStatus.OK);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'DIRECTOR')")
    @PostMapping(value = "/export/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<String> exportToPDF(
            HttpServletResponse response,
            @RequestBody List<UserResponse> userResponseList)
            throws IOException {
        exportService.export(response, "user", "pdf");
        EmpPDFExporter userPDFExporter = new EmpPDFExporter(userResponseList);
        userPDFExporter.export(response);
        return new ResponseEntity<>("Export To PDF Successfully", HttpStatus.OK);
    }
}