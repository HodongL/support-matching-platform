package com.smp.backend.controller;

import com.smp.backend.service.YouthPolicyService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/youth")
@CrossOrigin(origins = "*") // 프론트엔드(React, JS 등)에서 접근 가능
public class YouthPolicyController {

    private final YouthPolicyService youthPolicyService;

    public YouthPolicyController(YouthPolicyService youthPolicyService) {
        this.youthPolicyService = youthPolicyService;
    }

    /**
     * 청년정책 API 호출 (기본 키워드: "청년")
     * 예: /api/youth?keyword=취업
     */
    @GetMapping
    public String getPolicyList(@RequestParam(defaultValue = "청년") String keyword) {
        return youthPolicyService.getPolicyList(keyword);
    }
}
