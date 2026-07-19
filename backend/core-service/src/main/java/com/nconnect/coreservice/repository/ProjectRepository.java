package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.Project;
import com.nconnect.coreservice.model.enums.ProjectStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProjectRepository extends JpaRepository<Project, UUID> {

    @Query("""
                SELECT p FROM Project p
                LEFT JOIN FETCH p.ngo n
                LEFT JOIN FETCH n.ngoProfile
                WHERE p.status = 'ACTIVE'
                AND (:category IS NULL OR p.category = :category)
                AND (
                    :search IS NULL
                    OR LOWER(CAST(p.title AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
                    OR LOWER(CAST(p.requiredSkills AS string)) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))
                )
                ORDER BY
                    CASE p.priorityLevel WHEN 'URGENT' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'NORMAL' THEN 3 ELSE 4 END,
                    p.createdAt DESC
            """)
    List<Project> searchProjects(@Param("category") String category,
                                 @Param("search") String search);

    @Query("""
                SELECT p FROM Project p
                LEFT JOIN FETCH p.ngo n
                LEFT JOIN FETCH n.ngoProfile
                WHERE p.ngo.id = :ngoId
                AND p.status != :cancelled
                ORDER BY p.createdAt DESC
            """)
    List<Project> findByNgoIdOrderByCreatedAtDesc(
            @Param("ngoId") UUID ngoId,
            @Param("cancelled") ProjectStatus cancelled
    );

    @Query("""
                SELECT p FROM Project p
                LEFT JOIN FETCH p.ngo n
                LEFT JOIN FETCH n.ngoProfile
                ORDER BY p.createdAt DESC
            """)
    List<Project> findAllWithNgo();

    List<Project> findByStatusOrderByCreatedAtDesc(ProjectStatus status);

    List<Project> findByNgoId(UUID ngoId);
}