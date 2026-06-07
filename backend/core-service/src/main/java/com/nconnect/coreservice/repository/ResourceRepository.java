package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.Resource;
import com.nconnect.coreservice.model.enums.ResourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    @Query("""
        SELECT r FROM Resource r
        LEFT JOIN FETCH r.owner o
        LEFT JOIN FETCH o.ngoProfile
        WHERE r.owner.id = :ownerId
        ORDER BY r.createdAt DESC
    """)
    List<Resource> findByOwnerIdOrderByCreatedAtDesc(@Param("ownerId") UUID ownerId);

    @Query("""
        SELECT r FROM Resource r
        LEFT JOIN FETCH r.owner o
        LEFT JOIN FETCH o.ngoProfile
        WHERE (:category IS NULL OR r.category = :category)
        AND (:status IS NULL OR r.status = :status)
        AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY r.createdAt DESC
    """)
    List<Resource> searchResources(@Param("category") String category,
                                   @Param("status") ResourceStatus status,
                                   @Param("search") String search);

    @Query("""
        SELECT r FROM Resource r
        LEFT JOIN FETCH r.owner o
        LEFT JOIN FETCH o.ngoProfile
        ORDER BY r.createdAt DESC
    """)
    List<Resource> findAllWithOwner();

    List<Resource> findByStatusOrderByCreatedAtDesc(ResourceStatus status);
}