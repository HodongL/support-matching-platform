package com.smp.backend.repository;

import com.smp.backend.model.SupportProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SupportRepository extends JpaRepository<SupportProgram, Long> {

    // 제목, 지역, 카테고리 중 하나라도 키워드가 포함되면 검색 결과로 반환
    List<SupportProgram> findByTitleContainingOrRegionContainingOrCategoryContaining(
            String title, String region, String category
    );
}
