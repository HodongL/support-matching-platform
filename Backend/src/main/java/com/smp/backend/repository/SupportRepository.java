package com.smp.backend.repository;

import com.smp.backend.model.SupportProgram;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SupportRepository extends JpaRepository<SupportProgram, Long> { }
