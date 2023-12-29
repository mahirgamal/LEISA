package com.leisa.microservice.list.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "username", nullable = false)
    private String username;

    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "queuename" , nullable = false)
    private String queuename;

    @Column(name = "admin")
    private Boolean admin;

    // Constructors, getters, and setters

    public User() {
        // Default constructor
    }

    public User(String username, String email, String password, String queuename, Boolean admin) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.queuename = queuename;
        this.admin = admin;
    }

    // Getters and setters for all fields

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getQueuename() {
        return queuename;
    }

    public void setQueuename(String queuename) {
        this.queuename = queuename;
    }

    public Boolean getAdmin() {
        return admin;
    }

    public void setAdmin(Boolean admin) {
        this.admin = admin;
    }
}
