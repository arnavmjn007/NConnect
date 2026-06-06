package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<AppUser, UUID> {

    Optional<AppUser> findByAuth0Id(String auth0Id);

    Optional<AppUser> findByEmail(String email);

    Optional<AppUser> findByUsername(String username);

    boolean existsByAuth0Id(String auth0Id);

    boolean existsByUsername(String username);

    @Query("""
        SELECT DISTINCT u FROM AppUser u
        LEFT JOIN FETCH u.skills
        LEFT JOIN FETCH u.interests
        LEFT JOIN FETCH u.languages
        LEFT JOIN FETCH u.causes
        LEFT JOIN FETCH u.ngoProfile
        WHERE u.auth0Id = :auth0Id
    """)
    Optional<AppUser> findByAuth0IdWithCollections(@Param("auth0Id") String auth0Id);
}