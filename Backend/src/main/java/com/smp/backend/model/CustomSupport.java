package com.smp.backend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_custom_support")
@Getter
@Setter
public class CustomSupport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 50)
    private String region;

    @Column(length = 50)
    private String category;

    @Column(length = 255)
    private String host;

    @Column(columnDefinition = "TEXT")
    private String targets;

    @Column(columnDefinition = "TEXT")
    private String benefit;

    @Column(name = "period_start")
    private LocalDate periodStart;

    @Column(name = "period_end")
    private LocalDate periodEnd;

    @Column(length = 500)
    private String link;

    @Column(length = 255)
    private String contact;

    @Column(length = 255)
    private String tags;  // "창업,투자" 형태로 저장

    @Column(length = 50)
    private String employment;

    @Column(name = "min_age")
    private Integer minAge;

    @Column(name = "max_age")
    private Integer maxAge;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
