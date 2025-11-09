package com.smp.backend.controller;

import com.smp.backend.model.SupportProgram;
import com.smp.backend.service.SupportService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:5174") // ← Vite 포트번호 맞게 수정
@RestController
@RequestMapping("/api/supports")
public class SupportController {

    private final SupportService service;

    public SupportController(SupportService service) {
        this.service = service;
    }

    @GetMapping
    public List<SupportProgram> getAllSupports() {
        return service.findAll();
    }
}
