package com.smp.backend.service;

import com.smp.backend.model.CustomSupport;
import com.smp.backend.repository.CustomSupportRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomSupportService {

    private final CustomSupportRepository repository;

    public CustomSupportService(CustomSupportRepository repository) {
        this.repository = repository;
    }

    public List<CustomSupport> findAll() {
        return repository.findAll();
    }

    public CustomSupport save(CustomSupport customSupport) {
        return repository.save(customSupport);
    }

    // 🔍 공백 또는 null을 빈 문자열로 치환
    private String clean(String text) {
        return (text == null) ? "" : text.trim();
    }

    // 🔍 맞춤형 검색 서비스
    public List<CustomSupport> search(String keyword, String region, String category) {

        keyword = clean(keyword);
        region = clean(region);
        category = clean(category);

        // 🔹 1. 키워드 + 지역 + 카테고리
        if (!keyword.isEmpty() && !region.isEmpty() && !category.isEmpty()) {
            return repository.searchByKeywordRegionCategory(keyword, region, category);
        }

        // 🔹 2. 키워드 + 지역
        if (!keyword.isEmpty() && !region.isEmpty()) {
            return repository.searchByKeywordAndRegion(keyword, region);
        }

        // 🔹 3. 키워드만
        if (!keyword.isEmpty()) {
            return repository.searchByKeyword(keyword);
        }

        // 🔹 4. 지역만
        if (!region.isEmpty()) {
            return repository.findByRegionContainingIgnoreCase(region);
        }

        // 🔹 5. 카테고리만
        if (!category.isEmpty()) {
            return repository.findByCategoryContainingIgnoreCase(category);
        }

        // 🔹 6. 조건 없음 → 전체 반환
        return repository.findAll();
    }
}
