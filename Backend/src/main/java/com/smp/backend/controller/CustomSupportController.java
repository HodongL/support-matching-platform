package com.smp.backend.controller;

import com.smp.backend.model.CustomSupport;
import com.smp.backend.service.CustomSupportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/custom-support")
@CrossOrigin(origins = "http://localhost:5173") // Vite 프론트와 연동
public class CustomSupportController {

    private final CustomSupportService service;

    public CustomSupportController(CustomSupportService service) {
        this.service = service;
    }

    /** 🔹 지원사업 저장 */
    @PostMapping("/save")
    public ResponseEntity<CustomSupport> save(@RequestBody CustomSupport cs) {
        return ResponseEntity.ok(service.save(cs));
    }

    /** 🔹 전체 목록 조회 */
    @GetMapping("/list")
    public ResponseEntity<List<CustomSupport>> list() {
        return ResponseEntity.ok(service.findAll());
    }

    /** 🔍 🔹 검색 API */
    @GetMapping("/search")
    public ResponseEntity<List<CustomSupport>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String region,
            @RequestParam(required = false) String category
    ) {
        List<CustomSupport> results = service.search(keyword, region, category);

        // ❗ 204 No Content 대신 → 빈 배열로 200 반환하는 것이 프론트 처리 더 쉬움
        // 필요하면 아래 주석 해제
        /*
        if (results.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        */

        return ResponseEntity.ok(results);
    }
}
