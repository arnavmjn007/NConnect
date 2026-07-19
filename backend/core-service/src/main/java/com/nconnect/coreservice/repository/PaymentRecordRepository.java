package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, UUID> {
    List<PaymentRecord> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<PaymentRecord> findByUserIdAndPurpose(UUID userId, String purpose);
    void deleteByUserId(UUID userId);
}