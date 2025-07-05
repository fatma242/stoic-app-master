package com.example.stoic.User;

import com.example.stoic.User.Controller.UserController;
import com.example.stoic.User.Model.OnboardingStatus;
import com.example.stoic.User.Model.User;
import com.example.stoic.User.Model.UserRole;
import com.example.stoic.User.Service.UserServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;

import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Map;
import java.util.NoSuchElementException;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = UserController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserServiceImpl userService;

    @Autowired
    private ObjectMapper objectMapper;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setUserId(1);
        sampleUser.setUsername("john");
        sampleUser.setEmail("john@example.com");
        sampleUser.setPassword("secret");
        sampleUser.setUserRole(UserRole.REG);
        sampleUser.setOnboardingStatus(OnboardingStatus.NORMAL);
    }

    @Test
    void getUsers_returnsList() throws Exception {
        Mockito.when(userService.findAll())
                .thenReturn(Arrays.asList(sampleUser));

        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId", is(1)))
                .andExpect(jsonPath("$[0].username", is("john")));
    }

    @Test
    void getUserById_found() throws Exception {
        Mockito.when(userService.findById(1)).thenReturn(sampleUser);

        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("john@example.com")));
    }

    @Test
    void deleteUserById_returnsNoContent() throws Exception {
        // userService.deleteById is void, so no setup needed
        mockMvc.perform(delete("/api/users/1"))
                .andExpect(status().isNoContent())
                .andExpect(content().string(containsString("User with ID 1 deleted.")));
        Mockito.verify(userService).deleteById(1);
    }

    @Test
    void updateUser_success() throws Exception {
        User updated = new User();
        updated.setUserId(1);
        updated.setUsername("johnny");
        updated.setEmail("johnny@example.com");
        updated.setPassword("newpass");
        updated.setUserRole(UserRole.ADMIN);
        // updated.setOnboardingStatus(OnboardingStatus.COMPLETE);

        Mockito.when(userService.findById(1)).thenReturn(sampleUser);
        Mockito.when(userService.update(any(User.class))).thenReturn(updated);

        mockMvc.perform(put("/api/users/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updated)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username", is("johnny")));
        // .andExpect(jsonPath("$.role", is("ADMIN")))
        // .andExpect(jsonPath("$.onboardingStatus", is("COMPLETE")));
    }

    @Test
    void register_failure_duplicateEmail() throws Exception {
        User toRegister = new User();
        toRegister.setUsername("john");
        toRegister.setEmail("john@example.com");
        toRegister.setPassword("pw");

        Mockito.when(userService.register(any(User.class)))
                .thenThrow(new RuntimeException("Email already exists"));

        mockMvc.perform(post("/api/users/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(toRegister)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error", is("Email already exists")));
    }

    @Test
    void getStatus_notFound() throws Exception {
        Mockito.when(userService.getStatus(99))
                .thenThrow(new NoSuchElementException());

        mockMvc.perform(get("/api/users/status/99"))
                .andExpect(status().isNotFound());
    }

    @Test
    void getAge_andGender_andRole() throws Exception {
        Mockito.when(userService.getAge(1)).thenReturn(30);
        Mockito.when(userService.getGender(1)).thenReturn("Male");
        Mockito.when(userService.getUserRole(1)).thenReturn(UserRole.ADMIN);

        mockMvc.perform(get("/api/users/age/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("30"));

        mockMvc.perform(get("/api/users/gender/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("Male"));

        mockMvc.perform(get("/api/users/role/1"))
                .andExpect(status().isOk())
                .andExpect(content().string("ADMIN"));
    }

    @Test
    void extreme_emptyListAndNulls() throws Exception {
        // service returns empty list
        Mockito.when(userService.findAll()).thenReturn(Arrays.asList());
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        // service returns null for single-user endpoint
        Mockito.when(userService.findById(1)).thenReturn(null);
        mockMvc.perform(get("/api/users/1"))
                .andExpect(status().isOk())
                .andExpect(content().string(""));
    }
}
