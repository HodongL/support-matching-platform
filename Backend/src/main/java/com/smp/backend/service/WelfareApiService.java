package com.smp.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class WelfareApiService {

    @Value("${api.welfare.key}")
    private String apiKey; // 환경 변수 또는 properties에서 불러옴

    private static final String BASE_URL = "https://apis.data.go.kr/B554287/welfareReform/getList";

    public String getWelfareList(int pageNo, int numOfRows) {
        try {
            String url = BASE_URL +
                "?serviceKey=" + apiKey +
                "&type=json&pageNo=" + pageNo +
                "&numOfRows=" + numOfRows;

            RestTemplate restTemplate = new RestTemplate();
            return restTemplate.getForObject(url, String.class);

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\":\"API 호출 실패\"}";
        }
    }
}
