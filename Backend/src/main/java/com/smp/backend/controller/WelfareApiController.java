package com.smp.backend.controller;

import com.smp.backend.service.WelfareApiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/welfare")
@CrossOrigin(origins = "*") // 프론트엔드 접근 허용 (localhost:5173 등)
public class WelfareApiController {

    private final WelfareApiService welfareApiService;

    public WelfareApiController(WelfareApiService welfareApiService) {
        this.welfareApiService = welfareApiService;
    }

    @GetMapping
    public String getWelfareList(
            @RequestParam(defaultValue = "1") int pageNo,
            @RequestParam(defaultValue = "10") int numOfRows) {
        return welfareApiService.getWelfareList(pageNo, numOfRows);
    }
}
