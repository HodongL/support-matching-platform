package com.smp.backend.controller;

import com.smp.backend.service.YouthPolicyApiService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/youth-policy")
@CrossOrigin(origins = "*")
public class YouthPolicyApiController {

    private final YouthPolicyApiService youthPolicyApiService;

    public YouthPolicyApiController(YouthPolicyApiService youthPolicyApiService) {
        this.youthPolicyApiService = youthPolicyApiService;
    }

    @GetMapping("/list")
    public String getYouthPolicyList(
            @RequestParam(defaultValue = "1") int pageNum,
            @RequestParam(defaultValue = "5") int pageSize) {

        return youthPolicyApiService.getYouthPolicyList(pageNum, pageSize);
    }
}
