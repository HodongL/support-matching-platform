package com.smp.backend.controller;

import com.smp.backend.model.SupportProgram;
import com.smp.backend.service.SupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5173") // 🔥 프론트엔드 Vite 서버 포트 허용
@RestController
@RequestMapping("/api/supports")
public class SupportController {

    private final SupportService supportService;

    public SupportController(SupportService supportService) {
        this.supportService = supportService;
    }

    /**
     * ✅ 전체 지원사업 목록 조회
     * 프론트엔드에서 페이지 로드 시 기본 호출
     * GET http://localhost:8080/api/supports
     */
    @GetMapping
    public ResponseEntity<List<SupportProgram>> getAllSupports() {
        List<SupportProgram> supports = supportService.findAll();
        if (supports.isEmpty()) {
            return ResponseEntity.noContent().build(); // 204 No Content
        }
        return ResponseEntity.ok(supports); // 200 OK + 데이터 반환
    }

    /**
     * ✅ 키워드 기반 검색
     * 예시: GET http://localhost:8080/api/supports/search?q=청년
     */
    @GetMapping("/search")
    public ResponseEntity<List<SupportProgram>> searchSupports(@RequestParam("q") String keyword) {
        List<SupportProgram> results = supportService.search(keyword);

        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(results);
    }

    /**
     * ✅ 헬스체크용 엔드포인트 (테스트용)
     * GET http://localhost:8080/api/supports/ping
     */
    @GetMapping("/ping")
    public ResponseEntity<String> ping() {
        return ResponseEntity.ok("✅ Support API is running!");
    }
}
