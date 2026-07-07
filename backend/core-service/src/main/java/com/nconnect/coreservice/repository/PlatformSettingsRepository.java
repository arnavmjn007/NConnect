package com.nconnect.coreservice.repository;

import com.nconnect.coreservice.model.PlatformSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PlatformSettingsRepository extends JpaRepository<PlatformSettings, java.util.UUID> {
}