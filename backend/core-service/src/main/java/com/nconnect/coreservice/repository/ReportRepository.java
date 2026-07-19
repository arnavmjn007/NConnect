package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.Report;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReportRepository extends JpaRepository<Report, UUID> {

    @EntityGraph(attributePaths = "reporter")
    List<Report> findAllByOrderByCreatedAtDesc();

    void deleteByReporterId(UUID reporterId);
}