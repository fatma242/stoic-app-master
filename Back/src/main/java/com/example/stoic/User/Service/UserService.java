package com.example.stoic.User.Service;

import com.example.stoic.User.Model.User;

import java.util.List;

public interface UserService {

    List<User> findAll();
    User findById(int id);
    User save(User user);
    void deleteById(int id);
    User update(User user);
    User register(User user);
    User login(String email, String password);
    User findByEmail(String email);

}
