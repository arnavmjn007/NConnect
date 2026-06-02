package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, UUID> {
}