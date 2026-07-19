package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.VolunteerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VolunteerApplicationRepository extends JpaRepository<VolunteerApplication, UUID> {

    List<VolunteerApplication> findByProjectIdOrderByCreatedAtDesc(UUID projectId);

    List<VolunteerApplication> findByApplicantIdOrderByCreatedAtDesc(UUID applicantId);

    boolean existsByProjectIdAndApplicantId(UUID projectId, UUID applicantId);

    Optional<VolunteerApplication> findByProjectIdAndApplicantId(UUID projectId, UUID applicantId);

    List<VolunteerApplication> findByProjectIdIn(List<UUID> projectIds);

    void deleteByApplicantId(UUID applicantId);

    void deleteByProjectId(UUID projectId);
}