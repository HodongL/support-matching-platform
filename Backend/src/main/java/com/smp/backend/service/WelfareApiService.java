package com.smp.backend.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WelfareApiService {

    private static final String API_URL =
            "https://api.odcloud.kr/api/15083323/v1/uddi:3929b807-3420-44d7-a851-cc741fce65a1";
    private static final String SERVICE_KEY =
            "a9201800c9fba81d5bdb33f6400b4d0761407ae2ba8efe85636d0c71655aa269";

    public String getWelfareList(int page, int perPage) {
        try {
            // ✅ 요청 URL 구성
            String url = API_URL +
                    "?page=" + page +
                    "&perPage=" + perPage +
                    "&serviceKey=" + SERVICE_KEY;

            RestTemplate restTemplate = new RestTemplate();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // ✅ API 호출
            ResponseEntity<String> response = restTemplate.exchange(
                    url, HttpMethod.GET, entity, String.class);

            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"API 호출 실패: " + e.getMessage() + "\"}";
        }
    }
}
