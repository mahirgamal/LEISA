package com.leisa.microservice.registration.Service;

import org.springframework.stereotype.Service;

import com.leisa.microservice.registration.model.User;
import com.leisa.microservice.registration.repository.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

        public List<User> getAllUsersExcept(String username) {
        return userRepository.findAll().stream()
                             .filter(user -> !user.getUsername().equals(username))
                             .collect(Collectors.toList());
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public User updateUser(Long id, User updatedUser) {
        if (userRepository.existsById(id)) {
            updatedUser.setId(id);
            return userRepository.save(updatedUser);
        } else {
            throw new IllegalArgumentException("User not found");
        }
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}


