package com.youzbaki.mudir.auth;

import com.youzbaki.mudir.security.JwtService;
import com.youzbaki.mudir.user.User;
import com.youzbaki.mudir.user.UserRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(
            @RequestBody RegisterRequest request) {

        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest()
                    .body("Email already registered");
        }

        User user = new User(
                request.email(),
                passwordEncoder.encode(request.password()),
                request.name()
        );

        userRepository.save(user);

        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(
                new AuthResponse(
                        token,
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                )
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElse(null);

        if (user == null ||
                !passwordEncoder.matches(
                        request.password(),
                        user.getPassword())) {

            return ResponseEntity.status(401)
                    .body("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return ResponseEntity.ok(
                new AuthResponse(
                        token,
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                )
        );
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        return ResponseEntity.ok(
                new UserResponse(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                )
        );
    }

    @DeleteMapping("/account")
    public ResponseEntity<?> deleteAccount(
            org.springframework.security.core.Authentication authentication) {

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return ResponseEntity.status(404).body("User not found");
        }

        userRepository.delete(user);

        return ResponseEntity.ok("Account deleted");
    }

    public record RegisterRequest(
            String email,
            String password,
            String name
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}

    public record AuthResponse(
            String token,
            Long id,
            String name,
            String email
    ) {}

    public record UserResponse(
            Long id,
            String name,
            String email
    ) {}
}