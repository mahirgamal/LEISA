package com.leisa.microservice.registration.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;


import com.leisa.microservice.registration.Service.UserService;
import com.leisa.microservice.registration.model.User;
import com.leisa.microservice.registration.repository.UserRepository;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/registration")
public class UserController {
    private final UserService userService;
    private final BCryptPasswordEncoder passwordEncoder; // Create an instance of BCryptPasswordEncoder

    // Inject the UserRepository or equivalent data access mechanism here
    private final UserRepository userRepository;

    public UserController(UserService userService, UserRepository userRepository) {
        this.userService = userService;
        this.passwordEncoder = new BCryptPasswordEncoder(); // Initialize BCryptPasswordEncoder
        this.userRepository = userRepository;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (isUserExists(user.getUsername(), user.getEmail())) {
            return ResponseEntity.badRequest().body("User already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    }

    @GetMapping("/listall")
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

        @GetMapping("/lista")
    public List<User> getAllUsersExceptAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String authenticatedUsername = authentication.getName();

        return userService.getAllUsersExcept(authenticatedUsername);
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        if (user.isPresent()) {
            return ResponseEntity.ok(user.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        try {
            User updated = userService.updateUser(id, updatedUser);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    public boolean isUserExists(String username, String email) {
        // Implement the logic to check if a user with the given username or email exists in your data store
        // Return true if a user with the same username or email is found, otherwise return false
        // You can use your userRepository or equivalent data access mechanism to perform this check
        return userRepository.existsByUsernameOrEmail(username, email);
    }
}

