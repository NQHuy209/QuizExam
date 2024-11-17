package com.example.quizexam_student.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf().disable()
                .exceptionHandling()
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .and()
                .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/user/**").hasAnyRole("ADMIN", "DIRECTOR")
                .requestMatchers("/api/class/**").hasAnyRole("ADMIN", "SRO")
                .requestMatchers("/api/subject/**").hasAnyRole("ADMIN", "DIRECTOR", "SRO", "TEACHER")
                .requestMatchers("/api/sem/**").permitAll()
                .requestMatchers("/api/student-management/**").hasAnyRole("ADMIN", "SRO", "TEACHER")
                .requestMatchers("/api/chapter/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/question/**").hasAnyRole("ADMIN", "TEACHER")
                .requestMatchers("/api/exam/**").hasAnyRole("ADMIN", "SRO", "STUDENT")
                .requestMatchers("/api/student-answers/**").hasRole("STUDENT")
                .requestMatchers("/api/mark/**").hasAnyRole("ADMIN", "STUDENT")
                .requestMatchers("/api/level/**").hasAnyRole("ADMIN", "DIRECTOR", "SRO")
                .requestMatchers("/api/role/**").hasAnyRole("ADMIN", "DIRECTOR", "TEACHER", "SRO")
                .requestMatchers("/api/question-record/**").hasRole("STUDENT")
                .requestMatchers("/uploads/**").permitAll()
                .anyRequest().authenticated()
                
                .and()
                .httpBasic();
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
