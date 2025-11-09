package com.smp.backend.service;

import com.smp.backend.model.SupportProgram;
import com.smp.backend.repository.SupportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportService {

    private final SupportRepository repo;

    public SupportService(SupportRepository repo) {
        this.repo = repo;
    }

    public List<SupportProgram> findAll() {
        return repo.findAll();
    }
}
