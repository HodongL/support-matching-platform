package com.smp.backend.repository;

import com.smp.backend.model.CustomSupport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CustomSupportRepository extends JpaRepository<CustomSupport, Long> {

    /** 🔍 키워드 검색: title + targets + benefit 전체 검색 */
    @Query("""
        SELECT c FROM CustomSupport c
        WHERE LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.targets) LIKE LOWER(CONCAT('%', :keyword, '%'))
           OR LOWER(c.benefit) LIKE LOWER(CONCAT('%', :keyword, '%'))
    """)
    List<CustomSupport> searchByKeyword(String keyword);

    /** 🔍 지역 검색 */
    List<CustomSupport> findByRegionContainingIgnoreCase(String region);

    /** 🔍 분야 검색 */
    List<CustomSupport> findByCategoryContainingIgnoreCase(String category);

    /** 🔍 키워드 + 지역 */
    @Query("""
        SELECT c FROM CustomSupport c
        WHERE (
                 LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(c.targets) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(c.benefit) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND LOWER(c.region) LIKE LOWER(CONCAT('%', :region, '%'))
    """)
    List<CustomSupport> searchByKeywordAndRegion(String keyword, String region);

    /** 🔍 키워드 + 지역 + 분야 */
    @Query("""
        SELECT c FROM CustomSupport c
        WHERE (
                 LOWER(c.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(c.targets) LIKE LOWER(CONCAT('%', :keyword, '%'))
              OR LOWER(c.benefit) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND LOWER(c.region) LIKE LOWER(CONCAT('%', :region, '%'))
        AND LOWER(c.category) LIKE LOWER(CONCAT('%', :category, '%'))
    """)
    List<CustomSupport> searchByKeywordRegionCategory(String keyword, String region, String category);
}
