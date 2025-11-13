package com.smp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class YouthPolicyApiService {

    @Value("${api.youthpolicy.key}")
    private String API_KEY;

    private static final String API_URL =
            "https://www.youthcenter.go.kr/go/ythip/getPlcy";

    public String getYouthPolicyList(int pageNum, int pageSize) {
        try {
            String url = API_URL +
                    "?apiKeyNm=" + API_KEY +
                    "&pageNum=" + pageNum +
                    "&pageSize=" + pageSize +
                    "&pageType=1";  // 목록조회

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"청년정책 API 호출 실패: " + e.getMessage() + "\"}";
        }
    }
}

