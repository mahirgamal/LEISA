package com.leisa.microservice.list.controller;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;


import com.leisa.microservice.list.Service.UserService;
import com.leisa.microservice.list.model.User;
import com.leisa.microservice.list.repository.UserRepository;

import java.util.List;


@RestController
@RequestMapping("/list")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        new BCryptPasswordEncoder();
    }

    @GetMapping("/listall")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

        @GetMapping("/list")
    public List<User> getAllUsersExceptAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        return userService.getAllUsersExcept(authenticatedUsername);
    }
}

