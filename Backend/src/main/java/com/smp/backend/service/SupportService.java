package com.smp.backend.service;

import com.smp.backend.model.SupportProgram;
import com.smp.backend.repository.SupportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SupportService {

    private final SupportRepository supportRepository;

    public SupportService(SupportRepository supportRepository) {
        this.supportRepository = supportRepository;
    }

    // 전체 목록 조회
    public List<SupportProgram> findAll() {
        return supportRepository.findAll();
    }

    // 키워드 검색
    public List<SupportProgram> search(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return supportRepository.findAll();
        }
        return supportRepository.findByTitleContainingOrRegionContainingOrCategoryContaining(keyword, keyword, keyword);
    }
}
