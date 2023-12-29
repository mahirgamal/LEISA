package com.leisa.microservice.list.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.leisa.microservice.list.model.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // You can add custom query methods here if needed

    boolean existsByUsernameOrEmail(String username, String email);

    Optional<User> findByUsername(String username);

}


