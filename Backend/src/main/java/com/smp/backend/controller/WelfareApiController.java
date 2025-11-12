package com.smp.backend.controller;

import com.smp.backend.service.WelfareApiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/welfare")
@CrossOrigin(origins = "*") // 프론트 접근 허용
public class WelfareApiController {

    private final WelfareApiService welfareApiService;

    public WelfareApiController(WelfareApiService welfareApiService) {
        this.welfareApiService = welfareApiService;
    }

    @GetMapping
    public String getWelfareList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int perPage) {

        return welfareApiService.getWelfareList(page, perPage);
    }
}
