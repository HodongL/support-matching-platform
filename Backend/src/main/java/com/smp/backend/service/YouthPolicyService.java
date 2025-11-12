package com.smp.backend.service;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

@Service
public class YouthPolicyService {

    private final String API_URL = "https://www.youthcenter.go.kr/opi/youthPlcyList.do";
    private final String API_KEY = "1634aeB6-533f-4f5e-921d-edf72cfaad21"; // ✅ 실제 발급받은 키 사용

    /**
     * 청년정책 포털 API 호출 (JSON 응답)
     * @param keyword 검색 키워드 (예: 취업, 창업 등)
     * @return API 응답 JSON 문자열
     */
    public String getPolicyList(String keyword) {
        try {
            // ✅ URL 빌드
            String url = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("openApiVlak", API_KEY)
                    .queryParam("display", 10)
                    .queryParam("pageIndex", 1)
                    .queryParam("query", keyword) // 실제 API는 'query' 파라미터 사용
                    .queryParam("srchPolyBizSecd", "") // 정책 구분 (선택)
                    .queryParam("type", "json") // JSON 응답 지정
                    .toUriString();

            // ✅ HTTP 요청 헤더 설정
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0");
            headers.set("Accept", "application/json");

            HttpEntity<String> entity = new HttpEntity<>(headers);

            // ✅ 요청 전송
            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<String> response =
                    restTemplate.exchange(url, HttpMethod.GET, entity, String.class);

            // ✅ 응답 반환
            return response.getBody();

        } catch (Exception e) {
            e.printStackTrace();
            return "{ \"error\": \"API 호출 실패\", \"message\": \"" + e.getMessage() + "\" }";
        }
    }
}
