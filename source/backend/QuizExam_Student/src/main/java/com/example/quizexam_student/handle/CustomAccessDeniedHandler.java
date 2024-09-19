package com.example.quizexam_student.handle;

import com.example.quizexam_student.bean.response.ErrorResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.PrintWriter;

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException) throws IOException, ServletException {
        ErrorResponse errorResponse = new ErrorResponse(HttpStatus.FORBIDDEN, "token", accessDeniedException.getMessage());
        response.setStatus(HttpStatus.FORBIDDEN.value());
        response.setContentType("text/json");
        response.setCharacterEncoding("UTF-8");
        ResponseEntity responseEntity = ResponseEntity.ofNullable(errorResponse);
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getWriter(), responseEntity);
        response.getWriter().write(mapper.writeValueAsString(errorResponse));
        //response.sendError(HttpServletResponse.SC_FORBIDDEN, responseEntity.getBody().toString());
    }
}