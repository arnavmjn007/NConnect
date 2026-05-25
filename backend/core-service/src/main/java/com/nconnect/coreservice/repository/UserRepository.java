package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByAuth0Id(String auth0Id);

    Optional<AppUser> findByEmail(String email);

    Optional<AppUser> findByUsername(String username);

    boolean existsByAuth0Id(String auth0Id);

    boolean existsByUsername(String username);
}