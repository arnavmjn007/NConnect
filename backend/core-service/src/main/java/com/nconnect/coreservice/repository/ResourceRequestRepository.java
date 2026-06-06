package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.ResourceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResourceRequestRepository extends JpaRepository<ResourceRequest, UUID> {

    List<ResourceRequest> findByRequesterIdOrderByCreatedAtDesc(UUID requesterId);

    List<ResourceRequest> findByResourceOwnerIdOrderByCreatedAtDesc(UUID ownerId);

    boolean existsByResourceIdAndRequesterId(UUID resourceId, UUID requesterId);
}