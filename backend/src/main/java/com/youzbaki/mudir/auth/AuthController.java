package com.youzbaki.mudir.auth;

import com.youzbaki.mudir.user.User;
import com.youzbaki.mudir.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already registered");
        }

        String hashedPassword =
                passwordEncoder.encode(request.password());

        User user = new User(
                request.email(),
                hashedPassword,
                request.name()
        );

        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully");
    }

    public record RegisterRequest(
            String email,
            String password,
            String name
    ) {}
}