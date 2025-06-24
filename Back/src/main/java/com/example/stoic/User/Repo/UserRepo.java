package com.example.stoic.User.Repo;

import com.example.stoic.User.Model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Integer>, JpaSpecificationExecutor<User> {
    /**
     * Look up a user by email address.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check existence of a username.
     */
    boolean existsByUsername(String username);

    /**
     * Look up a user by username.
     */
    
}
